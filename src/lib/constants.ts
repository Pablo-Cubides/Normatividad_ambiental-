// Flag emojis for countries (used by country selector and homepage previews)
export const flagMap: Record<string, string> = {
	"colombia": "🇨🇴",
	"mexico": "🇲🇽",
	"peru": "🇵🇪",
	"chile": "🇨🇱",
	"argentina": "🇦🇷",
	"estados-unidos": "🇺🇸",
	"brasil": "🇧🇷",
	"brazil": "🇧🇷",
	"españa": "🇪🇸",
	"union-europea": "🇪🇺",
	"el-salvador": "🇸🇻",
	"china": "🇨🇳",
	"oms": "🏛️",
	"ecuador": "🇪🇨",
	// ISO-like short codes (some places may emit upper-case country codes)
	"co": "🇨🇴",
	"mx": "🇲🇽",
	"pe": "🇵🇪",
	"ar": "🇦🇷",
	"cl": "🇨🇱",
	"br": "🇧🇷",
	"sv": "🇸🇻",
	"us": "🇺🇸",
	"eu": "🇪🇺",
	"cn": "🇨🇳",
	"ec": "🇪🇨",
};

// Domains available in the system
export const DOMINIOS = [
	{ id: 'agua', label: 'Calidad del Agua', icon: '💧', description: 'Estándares de calidad de agua por sectores de uso' },
	{ id: 'calidad-aire', label: 'Calidad del Aire', icon: '💨', description: 'Estándares de calidad del aire' },
	{ id: 'residuos-solidos', label: 'Residuos Sólidos', icon: '♻️', description: 'Estándares de gestión de residuos sólidos' },
	{ id: 'vertimientos', label: 'Vertimientos', icon: '🫗', description: 'Estándares para vertimientos de aguas residuales' },
];

// Helper: produce a flag emoji for many inputs.
// Accepts slug-like keys (e.g. 'colombia'), two-letter ISO (e.g. 'co' or 'CO')
// or falls back to generating initials from the provided name.
export function getFlagEmoji(code?: string, name?: string): string {
	if (!code) return '🏳️';
	const key = String(code).toLowerCase();
	// Known explicit map first
	if (flagMap[key]) return flagMap[key];

	// Common slug -> iso overrides for slugs like 'brasil', 'estados-unidos', etc.
	const slugToIso: Record<string, string> = {
		colombia: 'co+', mexico: 'mx', peru: 'pe', chile: 'cl', argentina: 'ar', brasil: 'br', brazil: 'br',
		'estados-unidos': 'us', eeuu: 'us', usa: 'us', 'united-states': 'us', 'union-europea': 'eu',
		espana: 'es', españa: 'es', portugal: 'pt', ecuador: 'ec', bolivia: 'bo', uruguay: 'uy', paraguay: 'py',
		guatemala: 'gt', honduras: 'hn', nicaragua: 'ni', 'costa-rica': 'cr', costarica: 'cr', 'republica-dominicana': 'do',
		dominicana: 'do', venezuela: 've', canada: 'ca', australia: 'au', nueva_zelanda: 'nz',
		japon: 'jp', china: 'cn', india: 'in', francia: 'fr', alemania: 'de', reino_unido: 'gb', 'united-kingdom': 'gb'
	};

	if (slugToIso[key]) {
		        const iso = slugToIso[key];
		        const A = 0x1F1E6;
		        try { return iso.toUpperCase().split('').map(c => String.fromCodePoint(A + c.charCodeAt(0) - 65)).join(''); } catch { /* fallthrough */ }	}

	// Try to derive from a 2-letter ISO code (take the first two chars if present)
	const isoGuess = key.slice(0, 2);
	if (/^[a-z]{2}$/.test(isoGuess)) {
		const A = 0x1F1E6; // Regional indicator symbol letter A
		try {
			return isoGuess.toUpperCase().split('').map(c => String.fromCodePoint(A + c.charCodeAt(0) - 65)).join('');
		} catch {
			// fall through to name-based fallback
		}
	}

	// Try to infer from the country name by matching tokens in slugToIso
	if (name && typeof name === 'string') {
		const lname = name.toLowerCase();
		for (const [slug, iso] of Object.entries(slugToIso)) {
			if (lname.includes(slug.replace(/[_-]/g, ' ')) || lname.includes(slug)) {
				const A = 0x1F1E6;
				try { return iso.toUpperCase().split('').map(c => String.fromCodePoint(A + c.charCodeAt(0) - 65)).join(''); } catch { /* fallthrough */ }
			}
		}
	}

	// Final fallback: white flag (avoid returning text initials which can look like prefixes)
	return '🏳️';
}

// Regulatory sources and official references for each country and domain
export interface RegulatorySource {
	name: string;
	url: string;
	description: string;
	type: 'official' | 'secondary' | 'government' | 'restricted';
	lastValidated?: string;
}

export const REGULATORY_SOURCES: Record<string, Record<string, RegulatorySource[]>> = {
	colombia: {
		agua: [
			{
				name: 'Resolucion 2115 de 2007',
				url: 'https://minvivienda.gov.co/sites/default/files/normativa/2115%20-%202007.pdf',
				description: 'Agua potable - Ministerio de Vivienda',
				type: 'official',
				lastValidated: '2025-10-20'
			},
			{
				name: 'Decreto 1594 de 1984',
				url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=18617',
				description: 'Uso agrícola - Ministerio Ambiente',
				type: 'government',
				lastValidated: '2025-10-20'
			},
			{
				name: 'Decreto 1594 de 1984',
				url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=18617',
				description: 'Uso pecuario - Ministerio Ambiente',
				type: 'government',
				lastValidated: '2025-10-20'
			},
			{
				name: 'Decreto 1594 de 1984',
				url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=18617',
				description: 'Recreación - Ministerio Ambiente',
				type: 'government',
				lastValidated: '2025-10-20'
			},
			{
				name: 'Resolucion 1256 de 2021',
				url: 'https://www.minambiente.gov.co/wp-content/uploads/2021/12/Resolucion-1256-de-2021.pdf',
				description: 'Reuso agrícola - Ministerio Ambiente',
				type: 'government',
				lastValidated: '2025-10-20'
			}
		],
		
		'calidad-aire': [
			{
				name: 'Resolución 2254 de 2017',
				url: 'https://www.minambiente.gov.co/wp-content/uploads/2021/10/Resolucion-2254-de-2017.pdf',
				description: 'Estándares de calidad del aire - MADS',
				type: 'government',
				lastValidated: '2025-10-20'
			},
			{
				name: 'Resolución 619 de 1997',
				url: 'https://www.minambiente.gov.co/wp-content/uploads/2021/08/resolucion-0619-de-1997.pdf',
				description: 'Normas de calidad aire ambiente - MADS',
				type: 'government',
				lastValidated: '2025-10-20'
			}
		],
		'residuos-solidos': [
			{
				name: 'Decreto 1077 de 2015 Sector Vivienda, Ciudad y Territorio',
				url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=77216',
				description: 'Regulación de residuos sólidos - Ministerio Vivienda',
				type: 'government',
				lastValidated: '2025-10-20'
			}
		],
		vertimientos: [
			{
				name: 'Resolución 631 de 2015',
				url: 'https://www.minambiente.gov.co/wp-content/uploads/2021/11/resolucion-631-de-2015.pdf',
				description: 'Estándares de emisión vertimientos - MADS',
				type: 'government',
				lastValidated: '2025-10-20'
			}
		]
	},
	chile: {
		agua: [
			{
				name: 'Norma Chilena oficial NCh409/1',
				url: 'https://ciperchile.cl/pdfs/11-2013/norovirus/NCh409.pdf',
				description: 'Agua potable',
				type: 'official',
				lastValidated: '2025-10-21'
			},
			{
				name: 'Norma Chilena oficial NCh409/1',
				url: 'https://ciperchile.cl/pdfs/11-2013/norovirus/NCh409.pdf',
				description: 'Bebida animales',
				type: 'official',
				lastValidated: '2025-10-21'
			},
			{
				name: 'Decreto 327 Reglamento de piscinas',
				url: 'https://www.bcn.cl/leychile/navegar?idNorma=178272',
				description: 'Recreación',
				type: 'government',
				lastValidated: '2025-10-21'
			},
			{
				name: 'Norma Chilena oficial NCh409/1',
				url: 'https://ciperchile.cl/pdfs/11-2013/norovirus/NCh409.pdf',
				description: 'Riego',
				type: 'official',
				lastValidated: '2025-10-21'
			},
			{
				name: 'Ley 21075 Regula la recolección, reutilización y disposición de aguas grises',
				url: 'https://www.bcn.cl/leychile/navegar?idNorma=1115066',
				description: 'Reutilización aguas grises',
				type: 'government',
				lastValidated: '2025-10-21'
			},
			{
				name: 'Norma Chilena oficial NCh409/1',
				url: 'https://ciperchile.cl/pdfs/11-2013/norovirus/NCh409.pdf',
				description: 'Vida acuática',
				type: 'official',
				lastValidated: '2025-10-21'
			}
		],
		'calidad-aire': [
			{
				name: 'Normas Calidad del aire',
				url: 'https://normasaire.mma.gob.cl/nambientales/normas-de-calidad-del-aire/',
				description: 'Normas de calidad aire',
				type: 'official',
				lastValidated: '2025-10-21'
			}
		],
		'residuos-solidos': [
			{
				name: 'Ley Nº 20.920 - Economía Circular',
				url: 'https://economiacircular.mma.gob.cl/ley-rep/',
				description: 'Residuos sólidos',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		],
		vertimientos: [
			{
				name: 'Decreto 90 Establece norma de emisión para la regulación de contaminantes asociados a las descargas de residuos líquidos a aguas marinas y continentales superficiales',
				url: 'https://www.bcn.cl/leychile/navegar?idNorma=182637',
				description: 'Vertimientos',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		]
	},
	mexico: {
		agua: [
			{
				name: 'NOM-127-SSA1-2021',
				url: 'https://www.dof.gob.mx/nota_detalle_popup.php?codigo=5650705',
				description: 'Agua consumo humano',
				type: 'official',
				lastValidated: '2025-10-21'
			},
			{
				name: 'NOM-002-SEMARNAT-1996',
				url: 'https://www.dof.gob.mx/nota_detalle.php?codigo=5645374&fecha=11/03/2022#gsc.tab=0',
				description: 'Reuso servicios públicos',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		],
		'calidad-aire': [
			{
				name: 'NOM-035-SEMARNAT-1993',
				url: 'https://www.profepa.gob.mx/innovaportal/file/1215/1/nom-035-semarnat-1993.pdf',
				description: 'Método medición calidad aire',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		],
		'residuos-solidos': [
			{
				name: 'LGPGIR - Ley General para la Prevención y Gestión Integral de los Residuos',
				url: 'https://www.gob.mx/semarnat/acciones-y-programas/ley-general-para-la-prevencion-y-gestion-integral-de-los-residuos',
				description: 'Marco legal mexicano para gestión de residuos',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		],
		vertimientos: [
			{
				name: 'NOM-001-SEMARNAT-2021',
				url: 'https://www.dof.gob.mx/nota_detalle.php?codigo=5645374&fecha=11/03/2022#gsc.tab=0',
				description: 'Vertimientos',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		]
	},
	peru: {
		agua: [
			{
				name: 'Decreto Supremo N.° 031-2010-SA',
				url: 'https://www.gob.pe/institucion/minsa/normas-legales/244805-031-2010-sa',
				description: 'Agua potable',
				type: 'official',
				lastValidated: '2025-10-21'
			},
			{
				name: 'Decreto Supremo N° 002-2008-MINAM',
				url: 'https://www.minam.gob.pe/disposiciones/decreto-supremo-n-002-2008-minam/',
				description: 'Conservación ambiente acuático E1',
				type: 'government',
				lastValidated: '2025-10-21'
			},
			{
				name: 'Decreto Supremo N.° 031-2010-SA',
				url: 'https://www.gob.pe/institucion/minsa/normas-legales/244805-031-2010-sa',
				description: 'Producción agua potable A1',
				type: 'official',
				lastValidated: '2025-10-21'
			},
			{
				name: 'Decreto Supremo N° 002-2008-MINAM',
				url: 'https://www.minam.gob.pe/disposiciones/decreto-supremo-n-002-2008-minam/',
				description: 'Riego vegetales bebida animales D1',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		],
		'calidad-aire': [
			{
				name: 'Decreto Supremo N° 003-2017-MINAM',
				url: 'https://www.minam.gob.pe/disposiciones/decreto-supremo-n-003-2017-minam/',
				description: 'Aire',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		],
		'residuos-solidos': [
			{
				name: 'Decreto Supremo N° 014-2017-MINAM',
				url: 'https://www.minam.gob.pe/disposiciones/decreto-supremo-n-014-2017-minam/',
				description: 'Residuos sólidos',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		],
		vertimientos: [
			{
				name: 'R.J. N° 224-2013-ANA',
				url: 'https://www.ana.gob.pe/sites/default/files/archivos/paginas/autorizaciones_de_vertimiento_y_reuso_segun_rj224_2013_ana.pdf',
				description: 'Vertimientos',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		]
	},
	argentina: {
		agua: [
			{
				name: 'Codigo Alimentario Argentino (CAA)',
				url: 'https://www.argentina.gob.ar/sites/default/files/2018/05/capitulo_xii_aguas_actualiz_2021-08.pdf',
				description: 'Agua Potable - CAA',
				type: 'official',
				lastValidated: '2025-10-20'
			},
			{
				name: 'Niveles Guia Nacionales de Calidad de Agua Ambiente - Metodologia para Riego',
				url: 'https://www.argentina.gob.ar/sites/default/files/documento4.pdf',
				description: 'Uso Agrícola - Riego',
				type: 'government',
				lastValidated: '2025-10-20'
			},
			{
				name: 'Cuidado del agua de las piletas',
				url: 'https://www.argentina.gob.ar/anmat/comunidad/informacion-de-interes-para-tu-salud/cuidado-del-agua#:~:text=Recomendaciones,precauciones%20y%20condiciones%20de%20almacenamiento.',
				description: 'Actividades Recreativas - ANMAT',
				type: 'government',
				lastValidated: '2025-10-20'
			},
			{
				name: 'Sistema Nacional de Areas Marinas Protegidas',
				url: 'https://www.argentina.gob.ar/normativa/nacional/ley-27037-239542/actualizacion',
				description: 'Protección Vida Acuática - Ley 27.037',
				type: 'government',
				lastValidated: '2025-10-20'
			}
		],
		'calidad-aire': [
			{
				name: 'Ley 20284/1973 Plan de prevención de situaciones críticas de contaminación atmosférica',
				url: 'https://www.argentina.gob.ar/normativa/nacional/ley-20284-40167/texto',
				description: 'Prevención de contaminación atmosférica',
				type: 'official',
				lastValidated: '2025-10-20'
			}
		],
		'residuos-solidos': [
			{
				name: 'Gestión de residuos sólidos domiciliarios Ley 25.916',
				url: 'https://www.argentina.gob.ar/normativa/nacional/ley-25916-98327/texto',
				description: 'Gestión integral de residuos domiciliarios',
				type: 'government',
				lastValidated: '2025-10-20'
			}
		],
		vertimientos: [
			{
				name: 'Decreto 674/1989',
				url: 'https://www.argentina.gob.ar/normativa/nacional/decreto-674-1989-16713',
				description: 'Estándares de vertimientos de aguas residuales',
				type: 'government',
				lastValidated: '2025-10-20'
			}
		]
	},
	brasil: {
		agua: [
			{
				name: 'Resolução CONAMA 357/2005',
				url: 'https://braziliannr.com/brazilian-environmental-legislation/conama-resolution-357-05-provisions-for-the-classification-of-water-bodies/',
				description: 'Clasificación de cuerpos de agua y criterios de calidad ambiental',
				type: 'government',
				lastValidated: '2025-10-21'
			},
			{
				name: 'Portaria de Consolidação GM/MS nº 5/2017',
				url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/agua-para-consumo-humano',
				description: 'Normas de potabilidad y control sanitario del agua para consumo humano',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		],
		'calidad-aire': [
			{
				name: 'CONAMA 506/2024',
				url: 'https://braziliannr.com/brazilian-environmental-legislation/conama-resolution-506-2024/',
				description: 'Actualización de estándares de calidad del aire',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		],
		'residuos-solidos': [
			{
				name: 'Lei 12.305/2010 - PNRS',
				url: 'https://panorama.solutions/sites/default/files/recurso_politica_nacional_de_residuos_solidos.pdf',
				description: 'Política Nacional de Resíduos Sólidos (PNRS)',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		],
		vertimientos: [
			{
				name: 'Resolución CONAMA 430/2011',
				url: 'https://braziliannr.com/brazilian-environmental-legislation/conama-resolution-430-2011/',
				description: 'Límites y criterios para vertimientos y descargas en cuerpos de agua',
				type: 'government',
				lastValidated: '2025-10-21'
			},
			{
				name: 'Política Nacional de Recursos Hídricos',
				url: 'https://www.gov.br/ana/pt-br/assuntos/gestao-das-aguas/politica-nacional-de-recursos-hidricos',
				description: 'Política general de gestión de recursos hídricos',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		]
	},
	'estados-unidos': {
		agua: [
			{
				name: 'Safe Drinking Water Act (SDWA)',
				url: 'https://www.epa.gov/sdwa',
				description: 'Federal law that protects public drinking water supplies throughout the U.S.',
				type: 'government',
				lastValidated: '2025-10-21'
			},
			{
				name: 'National Primary Drinking Water Regulations (NPDWR)',
				url: 'https://www.epa.gov/ground-water-and-drinking-water/national-primary-drinking-water-regulations',
				description: 'Primary (health-based) standards for contaminants in drinking water',
				type: 'government',
				lastValidated: '2025-10-21'
			},
			{
				name: 'EPA Water Quality Criteria and Standards',
				url: 'https://www.epa.gov/wqc',
				description: 'Guidance for water quality criteria used to protect aquatic life and human health',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		],
		vertimientos: [
			{
				name: 'Clean Water Act (CWA)',
				url: 'https://www.epa.gov/laws-regulations/summary-clean-water-act',
				description: 'Primary federal law governing water pollution (NPDES permits and effluent limits)',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		],
		'residuos-solidos': [
			{
				name: 'Resource Conservation and Recovery Act (RCRA)',
				url: 'https://www.epa.gov/rcra',
				description: 'Framework for proper management of hazardous and non-hazardous solid wastes',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		],
		'calidad-aire': [
			{
				name: 'Clean Air Act (CAA)',
				url: 'https://www.epa.gov/clean-air-act-overview',
				description: 'Federal law regulating air emissions from stationary and mobile sources',
				type: 'government',
				lastValidated: '2025-10-21'
			},
			{
				name: 'NAAQS (National Ambient Air Quality Standards)',
				url: 'https://www.epa.gov/criteria-air-pollutants/naaqs-table',
				description: 'Standards for common air pollutants to protect public health and welfare',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		],
		reuse: [
			{
				name: 'EPA Water Reuse Action Plan and Technical Guidance',
				url: 'https://www.epa.gov/waterreuse',
				description: 'Guidance and action plans supporting potable and non-potable water reuse',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		]
	},

	'union-europea': {
		agua: [
			{
				name: 'DIRECTIVA (UE) 2020/2184 DEL PARLAMENTO EUROPEO Y DEL CONSEJO de 16 de diciembre de 2020',
				url: 'https://eur-lex.europa.eu/eli/dir/2020/2184/oj/spa',
				description: 'Agua potable - Directiva (UE) 2020/2184',
				type: 'official',
				lastValidated: '2025-10-21'
			},
			{
				name: 'Water Framework Directive 2000/60/EC',
				url: 'https://environment.ec.europa.eu/topics/water/water-framework-directive_en',
				description: 'Calidad ambiental - superficies (WFD)',
				type: 'official',
				lastValidated: '2025-10-21'
			},
			{
				name: 'Reglamento (UE) 2020/741',
				url: 'https://www.boe.es/doue/2020/177/L00032-00055.pdf',
				description: 'Reutilización para riego agrícola (Reglamento 2020/741)',
				type: 'official',
				lastValidated: '2025-10-21'
			}
		],
		'calidad-aire': [
			{
				name: 'Air Quality Directive 2008/50/EC',
				url: 'https://ec.europa.eu/environment/air/quality/standards.htm',
				description: 'Calidad del Aire - Directiva 2008/50/EC',
				type: 'official',
				lastValidated: '2025-10-21'
			}
		],
		'residuos-solidos': [
			{
				name: 'Directiva Marco de Residuos (2008/98/EC)',
				url: 'https://eur-lex.europa.eu/ES/legal-content/summary/eu-waste-management-law.html',
				description: 'Peligrosos - Directiva Marco de Residuos (2008/98/EC)',
				type: 'official',
				lastValidated: '2025-10-21'
			},
			{
				name: 'Directiva Marco de Residuos (2008/98/EC)',
				url: 'https://eur-lex.europa.eu/ES/legal-content/summary/eu-waste-management-law.html',
				description: 'Municipales/Ordinarios - Directiva Marco de Residuos (2008/98/EC)',
				type: 'official',
				lastValidated: '2025-10-21'
			},
			{
				name: 'Directiva Marco de Residuos (2008/98/EC)',
				url: 'https://eur-lex.europa.eu/ES/legal-content/summary/eu-waste-management-law.html',
				description: 'RCD - Directiva Marco de Residuos (2008/98/EC)',
				type: 'official',
				lastValidated: '2025-10-21'
			},
			{
				name: 'Directiva Marco de Residuos (2008/98/EC)',
				url: 'https://eur-lex.europa.eu/ES/legal-content/summary/eu-waste-management-law.html',
				description: 'Orgánicos - Directiva Marco de Residuos (2008/98/EC)',
				type: 'official',
				lastValidated: '2025-10-21'
			}
		],
		'vertimientos': [
			{
				name: 'Directiva (UE) 2024/3019 del Parlamento Europeo y del Consejo, de 27 de noviembre de 2024',
				url: 'https://www.boe.es/buscar/doc.php?id=DOUE-L-2024-81831',
				description: 'Vertimientos - tratamiento de aguas residuales urbanas (Directiva 2024/3019)',
				type: 'official',
				lastValidated: '2025-10-21'
			}
		]
	},
	'el-salvador': {
		agua: [
			{
				name: 'Norma Salvadoreña NSO 13.49.1:07',
				url: 'https://ampeid.org/static/b3cc7d88c8ea9c8f7bb421e07a43dfa7/els190977..pdf',
				description: 'Agua potable - NSO 13.49.1:07',
				type: 'government',
				lastValidated: '2025-10-21'
			},
			{
				name: 'Norma Salvadoreña NSO 13.49.1:07 (descarga especial)',
				url: 'https://ampeid.org/static/b3cc7d88c8ea9c8f7bb421e07a43dfa7/els190977..pdf',
				description: 'Descarga aguas residuales especial - NSO 13.49.1:07',
				type: 'government',
				lastValidated: '2025-10-21'
			},
			{
				name: 'Norma Salvadoreña NSO 13.49.1:07 (descarga ordinario)',
				url: 'https://ampeid.org/static/b3cc7d88c8ea9c8f7bb421e07a43dfa7/els190977..pdf',
				description: 'Descarga aguas residuales ordinario - NSO 13.49.1:07',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		],
		'calidad-aire': [
			{
				name: 'Norma Salvadoreña NSO 13.11.01:01',
				url: 'https://static1.squarespace.com/static/61aa0c6042712531d32cace0/t/61af89854e59a030308b0558/1638893958019/Inmisiones+nso+13.11.01.01.pdf',
				description: 'Calidad del Aire - NSO 13.11.01:01',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		],
		'residuos-solidos': [
			{
				name: 'Ley de Gestión Integral de Residuos y Fomento al Reciclaje (LEGIR) y su Reglamento',
				url: 'https://bibliotecaambiental.ambiente.gob.sv/documentos/decreto-no-527-ley-de-gestion-integral-de-residuos-y-fomento-al-reciclaje/',
				description: 'LEGIR - Todos los residuos',
				type: 'government',
				lastValidated: '2025-10-21'
			},
			{
				name: 'LEGIR - RESPEL (Peligrosos)',
				url: 'https://bibliotecaambiental.ambiente.gob.sv/documentos/decreto-no-527-ley-de-gestion-integral-de-residuos-y-fomento-al-reciclaje/',
				description: 'LEGIR - Peligrosos (RESPEL)',
				type: 'government',
				lastValidated: '2025-10-21'
			},
			{
				name: 'LEGIR - Municipales y Orgánicos',
				url: 'https://bibliotecaambiental.ambiente.gob.sv/documentos/decreto-no-527-ley-de-gestion-integral-de-residuos-y-fomento-al-reciclaje/',
				description: 'LEGIR - Municipales y Orgánicos',
				type: 'government',
				lastValidated: '2025-10-21'
			},
			{
				name: 'LEGIR - RCD',
				url: 'https://bibliotecaambiental.ambiente.gob.sv/documentos/decreto-no-527-ley-de-gestion-integral-de-residuos-y-fomento-al-reciclaje/',
				description: 'LEGIR - RCD',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		],
		vertimientos: [
			{
				name: 'Decreto N° 253 de 2021',
				url: 'https://www.asamblea.gob.sv/sites/default/files/documents/decretos/9C3B0A90-8192-41BA-A947-C45F686C9C6E.pdf',
				description: 'Vertimientos - Decreto 253/2021',
				type: 'government',
				lastValidated: '2025-10-21'
			}
		]
	},
	china: {
		agua: [
			{
				name: 'Standards for Drinking Water Quality GB 5749-2022',
				url: 'https://favv-afsca.be/sites/default/files/export/vtp/cn/03/20240606_GB5749_2022.pdf',
				description: 'Agua potable - GB 5749-2022',
				type: 'official',
				lastValidated: '2025-10-21'
			},
			{
				name: 'Environmental quality standard for surface water (GB 3838)',
				url: 'https://english.mee.gov.cn/Resources/standards/water_environment/quality_standard/200710/t20071024_111792.shtml',
				description: 'Aguas superficiales - GB 3838',
				type: 'official',
				lastValidated: '2025-10-21'
			}
		],
		'calidad-aire': [
			{
				name: 'Ambient air quality standards GB 3095-2012',
				url: 'https://english.mee.gov.cn/Resources/standards/Air_Environment/quality_standard1/201605/t20160511_337502.shtml',
				description: 'Calidad del Aire - GB 3095-2012',
				type: 'official',
				lastValidated: '2025-10-21'
			}
		],
	'residuos-solidos': [
			{
				name: 'Standards for pollution control on the storage and disposal site for general industrial solid wastes',
				url: 'https://english.mee.gov.cn/Resources/standards/Solid_Waste/SW_control/200710/t20071024_111904.shtml',
				description: 'Residuos sólidos - Almacenamiento y disposición',
				type: 'official',
				lastValidated: '2025-10-21'
			}
		],
		vertimientos: [
			{
				name: 'Integrated wastewater discharge standard (GB 8978-1996)',
				url: 'https://www.chinesestandard.net/PDF-EN/GB8978-1996EN-P15P-H12580H-778202.pdf',
				description: 'Vertimientos - GB 8978-1996',
				type: 'official',
				lastValidated: '2025-10-21'
			}
		]
	},
	ecuador: {
		agua: [
			{
				name: 'Norma TULAS',
				url: 'https://www.ambiente.gob.ec/',
				description: 'Texto Unificado Legislación Ambiental',
				type: 'government',
				lastValidated: '2025-10-19'
			}
		]
	}
};

// Valid allowed values for security
export const ALLOWED_DOMAINS = DOMINIOS.map(d => d.id);
export const ALLOWED_COUNTRIES = Object.keys(flagMap).filter(key =>
  key.length > 2 || /^[a-z]{2}$/.test(key) // Allow full names and 2-letter codes
);

// Security validation functions
export function validateDomain(domain: string | null): string | null {
  if (!domain) return null;
  const normalized = domain.toLowerCase().trim();
  return ALLOWED_DOMAINS.includes(normalized) ? normalized : null;
}

export function validateCountry(country: string | null): string | null {
  if (!country) return null;
  const normalized = country.toLowerCase().trim();
  return ALLOWED_COUNTRIES.includes(normalized) ? normalized : null;
}

export function validateSector(sector: string | null): string | null {
  if (!sector) return null;
  // Allow alphanumeric, hyphens, underscores, and spaces
  if (!/^[a-zA-Z0-9\-_\s]+$/.test(sector)) return null;
  return sector.toLowerCase().trim();
}

// Sanitize filename to prevent path traversal
export function sanitizeFilename(filename: string): string {
  // Remove any path separators and dangerous characters
  return filename.replace(/[\\/:*?"<>|]/g, '').replace(/\.\./g, '').toLowerCase();
}
