// Environment variable utilities
export const getApiKey = (keyName: string): string | null => {
  // Check Vite environment variables first
  const viteKey = import.meta.env?.[keyName];
  if (viteKey) {
    console.log(`✅ Found ${keyName} in import.meta.env`);
    return viteKey;
  }
  
  // Check Node.js process.env (for SSR)
  const processKey = process.env?.[keyName];
  if (processKey) {
    console.log(`✅ Found ${keyName} in process.env`);
    return processKey;
  }
  
  console.log(`❌ ${keyName} not found in any environment`);
  console.log('Available VITE_ env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
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

// Debug function to check environment variables
export const debugEnvironment = (): void => {
  console.log('Environment Debug Info:');
  console.log('MODE:', import.meta.env?.MODE);
  console.log('DEV:', import.meta.env?.DEV);
  console.log('PROD:', import.meta.env?.PROD);
  console.log('VITE_GEMINI_API_KEY exists:', !!import.meta.env?.VITE_GEMINI_API_KEY);
  console.log('VITE_GEMINI_API_KEY length:', import.meta.env?.VITE_GEMINI_API_KEY?.length || 0);
  console.log('All VITE_ env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
};

// Environment check utilities
export const isDevelopment = (): boolean => {
  return import.meta.env?.MODE === 'development';
};

export const isProduction = (): boolean => {
  return import.meta.env?.MODE === 'production';
};
