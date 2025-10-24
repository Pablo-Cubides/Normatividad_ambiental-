// Simple logger utility for server-side logging
// Uses console.log with structured format for better debugging

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    if (meta) {
      console.log(`[info] ${message}`, meta);
    } else {
      console.log(`[info] ${message}`);
    }
  },
  
  warn: (message: string, meta?: Record<string, unknown>) => {
    if (meta) {
      console.warn(`[warn] ${message}`, meta);
    } else {
      console.warn(`[warn] ${message}`);
    }
  },
  
  error: (message: string, meta?: Record<string, unknown>) => {
    if (meta) {
      console.error(`[error] ${message}`, meta);
    } else {
      console.error(`[error] ${message}`);
    }
  },
  
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      if (meta) {
        console.debug(`[debug] ${message}`, meta);
      } else {
        console.debug(`[debug] ${message}`);
      }
    }
  },
};
