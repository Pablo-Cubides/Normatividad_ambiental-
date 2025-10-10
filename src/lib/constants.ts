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
};

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
		colombia: 'co', mexico: 'mx', peru: 'pe', chile: 'cl', argentina: 'ar', brasil: 'br', brazil: 'br',
		'estados-unidos': 'us', eeuu: 'us', usa: 'us', 'united-states': 'us', 'union-europea': 'eu',
		espana: 'es', españa: 'es', portugal: 'pt', ecuador: 'ec', bolivia: 'bo', uruguay: 'uy', paraguay: 'py',
		guatemala: 'gt', honduras: 'hn', nicaragua: 'ni', 'costa-rica': 'cr', costarica: 'cr', 'republica-dominicana': 'do',
		dominicana: 'do', venezuela: 've', canada: 'ca', australia: 'au', nueva_zelanda: 'nz',
		japon: 'jp', china: 'cn', india: 'in', francia: 'fr', alemania: 'de', reino_unido: 'gb', 'united-kingdom': 'gb'
	};

	if (slugToIso[key]) {
		const iso = slugToIso[key];
		const A = 0x1F1E6;
		try { return iso.toUpperCase().split('').map(c => String.fromCodePoint(A + c.charCodeAt(0) - 65)).join(''); } catch (_) { /* fallthrough */ }
	}

	// Try to derive from a 2-letter ISO code (take the first two chars if present)
	const isoGuess = key.slice(0, 2);
	if (/^[a-z]{2}$/.test(isoGuess)) {
		const A = 0x1F1E6; // Regional indicator symbol letter A
		try {
			return isoGuess.toUpperCase().split('').map(c => String.fromCodePoint(A + c.charCodeAt(0) - 65)).join('');
		} catch (_) {
			// fall through to name-based fallback
		}
	}

	// Try to infer from the country name by matching tokens in slugToIso
	if (name && typeof name === 'string') {
		const lname = name.toLowerCase();
		for (const [slug, iso] of Object.entries(slugToIso)) {
			if (lname.includes(slug.replace(/[_-]/g, ' ')) || lname.includes(slug)) {
				const A = 0x1F1E6;
				try { return iso.toUpperCase().split('').map(c => String.fromCodePoint(A + c.charCodeAt(0) - 65)).join(''); } catch (_) { /* fallthrough */ }
			}
		}
	}

	// Final fallback: white flag (avoid returning text initials which can look like prefixes)
	return '🏳️';
}
