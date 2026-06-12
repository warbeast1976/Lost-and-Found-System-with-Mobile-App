/**
 * Set via qr-scanner/.env (EXPO_PUBLIC_API_BASE_URL).
 * That file is auto-updated from the project root .env — run: npm run sync-env
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (!fromEnv) {
    throw new Error(
      'Missing EXPO_PUBLIC_API_BASE_URL. Set API_BASE_URL in the project root .env and run: npm run sync-env',
    );
  }
  return fromEnv.replace(/\/$/, '');
}

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}
