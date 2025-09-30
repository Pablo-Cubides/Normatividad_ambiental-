#!/usr/bin/env node
/*
  scripts/extract-pdf-to-json.ts
  Heurístico: extrae texto de un PDF y trata de convertir tablas en JSON normalizado.
  Uso (local):
    npx ts-node scripts/extract-pdf-to-json.ts --pdf "Content/Estándares de Calidad del Agua por País y Uso.pdf" --dominio agua-potable

  Notas:
  - Este script usa heurísticas de texto y puede requerir revisión manual.
  - Registra advertencias en data/json/_issues.log
*/

import fs from 'fs'
import path from 'path'
import pdfParse from 'pdf-parse'

type NormaRegistro = {
  parametro: string
  limite: string
  unidad: string | null
  notas: string[]
  referencia: {
    norma?: string
    entidad?: string
    anio?: number | string
    url?: string
  }
  categoria: 'microbiológico' | 'fisicoquímico' | 'metales' | 'nutrientes' | 'orgánicos' | 'otros'
}

type PaisNorma = {
  pais: string
  dominio: string
  version: string
  registros: NormaRegistro[]
}

function logIssue(message: string) {
  const issuesPath = path.join(process.cwd(), 'data', 'json', '_issues.log')
  const ts = new Date().toISOString()
  const line = `${ts} ${message}\n`
  fs.appendFileSync(issuesPath, line)
  console.warn('[ISSUE]', line.trim())
}

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

function detectUnit(token: string): string | null {
  const patterns = ['mg/L', 'μg/m3', 'μg/m³', 'mg/m3', 'NMP', 'UFC', 'UNT', 'kg/persona/día', '%', '°C']
  const regexes: RegExp[] = patterns.map(p => new RegExp(p.replace(/[-\/\\^$*+?.()|[\\\]{}]/g, '\\$&'), 'i'))
  for (const rx of regexes) {
    if (rx.test(token)) return token.trim()
  }
  return null
}

function detectCategory(param: string): NormaRegistro['categoria'] {
  const p = param.toLowerCase()
  if (p.match(/coli|coliform|enterococ|e\. coli|faecal|fecal/)) return 'microbiológico'
  if (p.match(/ph|turbid|turbiedad|color|cloro|conductividad|sólidos|sólido|sodio|potasio|fosf/)) return 'fisicoquímico'
  if (p.match(/plomo|arsénic|arsenic|mercuri|cadmi|cobre|niquel|níquel|pb|as|hg|cd|cu|ni/)) return 'metales'
  if (p.match(/nitrat|nitrit|amonio|nitrógeno|fosfor/)) return 'nutrientes'
  if (p.match(/pesticid|herbicid|hidrocarbu|orgánico|orgánicos/)) return 'orgánicos'
  return 'otros'
}

function safeString(s?: string) {
  if (!s) return ''
  return String(s).replace(/\s+/g, ' ').trim()
}

async function main() {
  const argv = process.argv.slice(2)
  const args: { [k: string]: string } = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : 'true'
      args[key] = val
      if (val !== 'true') i++
    }
  }

  const pdfPath = args['pdf'] || path.join(process.cwd(), 'Content', 'Estándares de Calidad del Agua por País y Uso.pdf')
  const dominio = (args['dominio'] || 'agua-potable').toLowerCase()

  if (!fs.existsSync(pdfPath)) {
    console.error('PDF no encontrado en:', pdfPath)
    return
  }

  console.log('Extrayendo PDF:', pdfPath)
  const buf = fs.readFileSync(pdfPath)
  let data: any
  try {
    data = await pdfParse(buf)
  } catch (err) {
    console.error('Error al parsear PDF con pdf-parse:', err)
    return
  }

  // Heurística: separar por saltos de página si es posible
  const rawText: string = data.text || ''
  const pages = rawText.split('\f') // pdf-parse may use form-feed for pages
  console.log(`Páginas detectadas: ${pages.length}`)

  // Cargar lista de países ya presentes en carpeta del dominio para ayudar a mapear
  const knownCountries = new Set<string>()
  const domainDir = path.join(process.cwd(), 'data', 'json', dominio)
  if (fs.existsSync(domainDir)) {
    for (const f of fs.readdirSync(domainDir)) knownCountries.add(path.basename(f, '.json').toLowerCase())
  }

  // Simplemente construimos un corpus y buscamos secciones por país
  const text = pages.join('\n')
  const lines = text.split(/\r?\n/).map(l => l.replace(/\u00A0/g, ' ').trim())

  // Heurística para detectar encabezados de país: línea que contiene nombre de country en lista conocida o mayúsculas
  const countryIndexes: { name: string, index: number }[] = []
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i]
    if (!L) continue
    const low = L.toLowerCase()
    // Si contiene un país conocido
    for (const kc of Array.from(knownCountries)) {
      if (low.includes(kc)) {
        countryIndexes.push({ name: kc, index: i })
      }
    }
    // Fallback: si la línea está en mayúsculas (y corta) puede ser un encabezado de país
    if (L === L.toUpperCase() && L.length > 2 && L.length < 40 && /[A-ZÁÉÍÓÚÑ]/.test(L)) {
      countryIndexes.push({ name: L, index: i })
    }
  }

  // If no country headers found, fallback: try to split by blank line groups and parse whole doc as single country
  if (countryIndexes.length === 0) {
    logIssue('No se detectaron encabezados de país automáticamente; el script intentará parsear todo el documento como una única fuente.')
    countryIndexes.push({ name: 'documento', index: 0 })
  }

  // For each detected country/header, collect lines until next header
  for (let ci = 0; ci < countryIndexes.length; ci++) {
    const entry = countryIndexes[ci]
    const start = entry.index
    const end = (ci + 1 < countryIndexes.length) ? countryIndexes[ci + 1].index : lines.length
    const chunk = lines.slice(start, end)

    const countryNameRaw = chunk[0] || entry.name
    const countryName = safeString(countryNameRaw)
    if (!countryName) continue

    console.log('Procesando sección sugerida para:', countryName)

    // Combine chunk lines that appear to be table rows. Heurística: rows with multiple columns separated by 2+ spaces
    const rowCandidates: string[] = []
    for (let i = 0; i < chunk.length; i++) {
      const L = chunk[i]
      if (!L) continue
      // If line contains multiple two-space separators, treat as possible row
      if (/\s{2,}/.test(L) || /\t/.test(L)) {
        rowCandidates.push(L)
        continue
      }
      // Also if line contains a unit-like token or percent or mg/L and number, keep
      if (/[0-9].*(mg\/L|μg|NMP|UFC|UNT|kg|%|°C)/i.test(L)) {
        rowCandidates.push(L)
        continue
      }
      // If line looks like 'Parametro - valor (unidad) nota' with dash
      if (/\s-\s/.test(L)) {
        rowCandidates.push(L)
        continue
      }
      // Else may be continuation of previous row: append to last
      if (rowCandidates.length > 0) {
        rowCandidates[rowCandidates.length - 1] += ' ' + L
      }
    }

    if (rowCandidates.length === 0) {
      logIssue(`No se detectaron filas en la sección de ${countryName}; guardando texto bruto para revisión.`)
      // Save raw chunk for manual review (sanitize filename)
      const reviewPath = path.join(process.cwd(), 'data', 'extracted_chunks')
      ensureDir(reviewPath)
      const safeChunkName = countryName.toLowerCase().replace(/[^a-z0-9\-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0,160) || 'chunk'
      fs.writeFileSync(path.join(reviewPath, `${safeChunkName}.txt`), chunk.join('\n'), 'utf8')
      continue
    }

    // Parse each row candidate into columns
    const registros: NormaRegistro[] = []
    rowCandidates.forEach((row, idx) => {
      // Normalize spaces
      const r = row.replace(/\s{2,}/g, ' | ').replace(/\t/g, ' | ')
      const parts = r.split('|').map(p => safeString(p))

      // Heurística flexible:
      // - Si 3+ columnas: [parametro, limite, unidad, ...rest]
      // - Si 2 columnas: [parametro, resto] -> intentar extraer valor+unidad del resto
      // - Si 1 columna: intentar separar por ' - ' o ' : '
      let parametro = ''
      let limite = ''
      let unidad: string | null = null
      let notas: string[] = []
      let referencia: any = {}

      if (parts.length >= 3) {
        parametro = parts[0]
        limite = parts[1]
        unidad = detectUnit(parts[2]) || parts[2] || null
        const tail = parts.slice(3).join('; ')
        if (tail) {
          // try to find year
          const y = tail.match(/(19|20)\d{2}/)
          if (y) referencia.anio = y[0]
          // split by common separators: semicolon, pipe, comma, closing bracket, dash or slash
          referencia.norma = tail.split(/[;|,\]\-\/]+/)[0]
          notas = tail.split(/[;|,]+/).map(s => safeString(s)).filter(Boolean)
        }
      } else if (parts.length === 2) {
        parametro = parts[0]
        const tail = parts[1]
        // try to extract a numeric/value + unit
        const m = tail.match(/([≤≤≤≤<>≤\d\.\s\-–to]+)\s*(mg\/L|μg\/m3|μg\/m³|mg\/m3|NMP|UFC|UNT|%|kg\/persona\/día|°C)?/i)
        if (m) {
          limite = safeString(m[1])
          unidad = m[2] || null
          const after = tail.replace(m[0], '')
          if (after) {
            const y = after.match(/(19|20)\d{2}/)
            if (y) referencia.anio = y[0]
            referencia.norma = after.split(/[;|,\]\-\/]+/)[0]
            notas = after.split(/[;|,]+/).map(s => safeString(s)).filter(Boolean)
          }
        } else {
          limite = tail
        }
      } else {
        // single column: try separators
        const sp = row.split(/\s-\s|:\s|—|–/)
        parametro = safeString(sp[0] || row)
        if (sp[1]) {
          const tail = sp.slice(1).join(' - ')
          const m = tail.match(/([≤≤≤≤<>≤\d\.\s\-–to]+)\s*(mg\/L|μg\/m3|μg\/m³|mg\/m3|NMP|UFC|UNT|%|kg\/persona\/día|°C)?/i)
          if (m) {
            limite = safeString(m[1])
            unidad = m[2] || null
            const after = tail.replace(m[0], '')
            notas = after ? [safeString(after)] : []
          } else {
            notas = [safeString(tail)]
          }
        }
      }

      if (!parametro) parametro = `parametro_desconocido_${idx}`
      if (!limite) {
        logIssue(`Fila sin límite detectado para '${parametro}' en ${countryName}. Fila: '${row.substring(0,120)}'`)
      }

      const categoria = detectCategory(parametro)

      registros.push({
        parametro: parametro,
        limite: limite || '',
        unidad: unidad || null,
        notas: notas,
        referencia: referencia,
        categoria
      })
    })

    // Prepare output dir and file (non-destructive candidates)
    const outDir = path.join(process.cwd(), 'data', 'json-candidates', dominio)
    ensureDir(outDir)
    // sanitize filename for Windows and remove problematic chars
    const safeCountryFileName = countryName.toLowerCase().replace(/[^a-z0-9\-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120) || 'documento'
    const outPath = path.join(outDir, `${safeCountryFileName}.json`)

    const paisNorma: PaisNorma = {
      pais: countryName,
      dominio,
      version: new Date().toISOString().slice(0,10),
      registros
    }

    fs.writeFileSync(outPath, JSON.stringify(paisNorma, null, 2), 'utf8')
    console.log('Escrito:', outPath, `(${registros.length} registros)`)
  }

  console.log('Procesamiento finalizado.')
}

main().catch(err => {
  console.error('Error inesperado en script:', err)
  logIssue(`Error inesperado en script: ${err && err.message ? err.message : String(err)}`)
})
