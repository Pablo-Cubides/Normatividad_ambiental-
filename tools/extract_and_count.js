const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

async function extract(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

function guessStructure(text) {
  // Heuristic approach: split by lines, look for country headings (all caps or lines ending with country names),
  // then detect sector headings by keywords like 'Sector', 'Uso', or by known sector names.
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const countries = [];
  let currentCountry = null;
  let currentSector = null;

  // Known sector keywords (spanish)
  const sectorKeywords = ['Agua Potable','Riego','Recreaci','Acuicultura','Vertimiento','Reuso','Conservaci','Industria','Ganader'];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Country headings often are all uppercase and short (e.g., COLOMBIA)
    if (/^[A-ZÁÉÍÓÚÑ\s]{3,}$/.test(line) && line.length < 40) {
      // start a new country
      currentCountry = { name: line.trim(), sectors: {} };
      countries.push(currentCountry);
      currentSector = null;
      continue;
    }

    // Another heuristic: lines that are country names with Title Case and preceded by 'País' or 'Country'
    if (/^(Pa[ií]s|PA[IÍ]S|Country)[:\-]?\s*(.+)$/i.test(line)) {
      const m = line.match(/^(?:Pa[ií]s|PA[IÍ]S|Country)[:\-]?\s*(.+)$/i);
      if (m) {
        currentCountry = { name: m[1].trim(), sectors: {} };
        countries.push(currentCountry);
        currentSector = null;
        continue;
      }
    }

    // detect sector by keywords
    for (const sk of sectorKeywords) {
      if (line.includes(sk)) {
        currentSector = sk;
        if (currentCountry) currentCountry.sectors[currentSector] = currentCountry.sectors[currentSector] || { parameters: 0 };
        break;
      }
    }

    // detect tabular parameter lines: heuristics - look for lines with numbers or units or 'mg/l' or 'NTU' or percent
    if (currentCountry && currentSector) {
      if (/\d+\.?\d*\s*(mg\/?l|mg\/l|ug\/?l|ntu|%|mg|ppm|ug)/i.test(line) || /valor l[ií]mite|l[ií]mite/i.test(line)) {
        currentCountry.sectors[currentSector].parameters += 1;
        continue;
      }

      // Lines that look like 'Parameter - value' or 'pH 6.5-8.5' - contains digits and letters
      if (/\b[a-zA-ZáéíóúñÁÉÍÓÚÑ\- ]+\b\s+\d/.test(line)) {
        currentCountry.sectors[currentSector].parameters += 1;
        continue;
      }
    }
  }

  return countries;
}

async function main() {
  const pdfPath = process.argv[2] || path.join(__dirname, '..', '..', 'Normatividad ambiental', 'Normatividad usos del agua.pdf');
  if (!fs.existsSync(pdfPath)) {
    console.error('PDF not found:', pdfPath);
    process.exit(1);
  }

  console.log('Extracting text from:', pdfPath);
  const text = await extract(pdfPath);
  console.log('Text length:', text.length);

  const countries = guessStructure(text);

  // Print CSV-like table: idx, country, sector, parameters
  console.log('idx,country,sector,parameters');
  let idx = 1;
  for (const c of countries) {
    const sectorNames = Object.keys(c.sectors);
    if (sectorNames.length === 0) {
      console.log(`${idx},"${c.name}","(none)",0`);
      idx++;
    } else {
      for (const s of sectorNames) {
        const pcount = c.sectors[s].parameters || 0;
        console.log(`${idx},"${c.name}","${s}",${pcount}`);
        idx++;
      }
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
