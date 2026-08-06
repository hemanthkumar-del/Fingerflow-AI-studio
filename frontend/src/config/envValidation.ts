export interface EnvValidationResult {
  isValid: boolean;
  missingVars: string[];
}

const REQUIRED_ENV_VARS = [
  'VITE_API_BASE_URL',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

/**
 * Validates presence of all required VITE_* environment variables at startup.
 */
export function validateEnvironment(): EnvValidationResult {
  const missingVars: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    const val = import.meta.env[key];
    if (!val || val.trim() === '' || val.includes('your_') || val.includes('demo-')) {
      missingVars.push(key);
    }
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}
