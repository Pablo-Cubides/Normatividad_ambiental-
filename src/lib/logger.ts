// Minimal logger shim used across API routes and server-side code.
// Keeps the same shape used in the codebase (info/warn/error) and
// avoids coupling to external logging libraries so the dev server can run.

type Meta = Record<string, unknown> | undefined;

export const logger = {
	info(message: string, meta?: Meta) {
		if (meta) console.info('[info]', message, meta);
		else console.info('[info]', message);
	},
	warn(message: string, meta?: Meta) {
		if (meta) console.warn('[warn]', message, meta);
		else console.warn('[warn]', message);
	},
	error(message: string, meta?: Meta) {
		if (meta) console.error('[error]', message, meta);
		else console.error('[error]', message);
	},
	debug(message: string, meta?: Meta) {
		if (meta) console.debug('[debug]', message, meta);
		else console.debug('[debug]', message);
	}
};

export default logger;
