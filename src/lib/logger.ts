// Simple structured logger used by both server and client code.
export const logger = {
  info: (message: string, meta: Record<string, unknown> = {}) => {
    try {
      console.info(JSON.stringify({ level: 'info', message, ts: new Date().toISOString(), ...meta }));
    } catch {
      // fallback
      console.info(message, meta);
    }
  },
  warn: (message: string, meta: Record<string, unknown> = {}) => {
    try {
      console.warn(JSON.stringify({ level: 'warn', message, ts: new Date().toISOString(), ...meta }));
    } catch {
      console.warn(message, meta);
    }
  },
  error: (message: string, meta: Record<string, unknown> = {}) => {
    try {
      console.error(JSON.stringify({ level: 'error', message, ts: new Date().toISOString(), ...meta }));
    } catch {
      console.error(message, meta);
    }
  }
};

export default logger;
