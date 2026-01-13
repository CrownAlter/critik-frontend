import { environment } from '../../../environments/environment';

/**
 * Converts a backend-provided relative image URL (e.g. `/uploads/<file>`) into an absolute URL.
 */
export function toAbsoluteApiUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  // `environment.apiBaseUrl` already includes protocol + host.
  return `${environment.apiBaseUrl}${path}`;
}
