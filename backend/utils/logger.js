/**
 * OmniMarket AI - Safe Logger Utility
 * Sanitizes logs to prevent accidental exposure of tokens, passwords, and API keys.
 */

const SENSITIVE_PATTERNS = [
  /EAA[a-zA-Z0-9_-]{30,}/g,           // Facebook tokens
  /AIza[0-9A-Za-z-_]{35}/g,           // Google API keys
  /bearer\s+[a-zA-Z0-9._-]+/gi,       // Bearer tokens
  /"password":\s*"[^"]+"/gi,          // Passwords in JSON
  /"access_token":\s*"[^"]+"/gi,      // Access tokens in JSON
  /mongodb(?:\+srv)?:\/\/[^@]+@/gi   // MongoDB credentials in URIs
];

const maskSensitiveData = (value) => {
  if (typeof value !== 'string') {
    try {
      value = JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  let sanitized = value;
  sanitized = sanitized.replace(/EAA[a-zA-Z0-9_-]{10,}/g, 'EAA***[REDACTED_FB_TOKEN]***');
  sanitized = sanitized.replace(/AIza[0-9A-Za-z-_]{10,}/g, 'AIza***[REDACTED_API_KEY]***');
  sanitized = sanitized.replace(/bearer\s+[a-zA-Z0-9._-]+/gi, 'Bearer ***[REDACTED_JWT]***');
  sanitized = sanitized.replace(/"password":\s*"[^"]+"/gi, '"password":"***[REDACTED]***"');
  sanitized = sanitized.replace(/"access_token":\s*"[^"]+"/gi, '"access_token":"***[REDACTED]***"');
  sanitized = sanitized.replace(/mongodb(?:\+srv)?:\/\/[^@]+@/gi, 'mongodb+srv://***:***@');
  return sanitized;
};

const formatMessage = (level, message, ...args) => {
  const timestamp = new Date().toISOString();
  const safeMessage = maskSensitiveData(message);
  const safeArgs = args.map(arg => maskSensitiveData(arg));
  return { timestamp, level, safeMessage, safeArgs };
};

const logger = {
  info: (message, ...args) => {
    const { timestamp, safeMessage, safeArgs } = formatMessage('INFO', message, ...args);
    console.log(`[${timestamp}] [INFO] ${safeMessage}`, ...safeArgs);
  },
  warn: (message, ...args) => {
    const { timestamp, safeMessage, safeArgs } = formatMessage('WARN', message, ...args);
    console.warn(`[${timestamp}] [WARN] ${safeMessage}`, ...safeArgs);
  },
  error: (message, ...args) => {
    const { timestamp, safeMessage, safeArgs } = formatMessage('ERROR', message, ...args);
    console.error(`[${timestamp}] [ERROR] ${safeMessage}`, ...safeArgs);
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      const { timestamp, safeMessage, safeArgs } = formatMessage('DEBUG', message, ...args);
      console.debug(`[${timestamp}] [DEBUG] ${safeMessage}`, ...safeArgs);
    }
  },
  mask: maskSensitiveData
};

module.exports = logger;
