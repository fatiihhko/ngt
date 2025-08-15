// Environment variable utilities
export const getApiKey = (keyName: string): string | null => {
  // Check Vite environment variables first
  const viteKey = import.meta.env?.[keyName];
  if (viteKey) return viteKey;
  
  // Check Node.js process.env (for SSR)
  const processKey = process.env?.[keyName];
  if (processKey) return processKey;
  
  return null;
};

export const hasApiKey = (keyName: string): boolean => {
  return !!getApiKey(keyName);
};

// Log warning only once per session
const loggedWarnings = new Set<string>();

export const logApiKeyWarning = (serviceName: string, keyName: string): void => {
  const warningKey = `${serviceName}-${keyName}`;
  if (!loggedWarnings.has(warningKey)) {
    console.warn(`No ${serviceName} API key found (${keyName}), using mock service`);
    loggedWarnings.add(warningKey);
  }
};

// Environment check utilities
export const isDevelopment = (): boolean => {
  return import.meta.env?.MODE === 'development';
};

export const isProduction = (): boolean => {
  return import.meta.env?.MODE === 'production';
};
