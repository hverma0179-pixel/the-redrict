import { AppError } from './AppError.js';

const HAS_PROTOCOL = /^[a-z][a-z\d+\-.]*:\/\//i;
const CONTROL_CHARS = /[\u0000-\u001F\u007F\s]/;

export function normalizeInputUrl(rawUrl, { allowProtocolFallback = true } = {}) {
  if (typeof rawUrl !== 'string') {
    throw new AppError('URL must be a string.', 400, 'INVALID_URL_TYPE');
  }

  const trimmed = rawUrl.trim();

  if (!trimmed || trimmed.length > 2048) {
    throw new AppError('URL must be between 1 and 2048 characters.', 400, 'INVALID_URL_LENGTH');
  }

  if (CONTROL_CHARS.test(trimmed)) {
    throw new AppError('URL cannot contain spaces or control characters.', 400, 'INVALID_URL_FORMAT');
  }

  const candidate = HAS_PROTOCOL.test(trimmed) || !allowProtocolFallback
    ? trimmed
    : `https://${trimmed}`;

  let url;
  try {
    url = new URL(candidate);
  } catch {
    throw new AppError('Enter a valid HTTP or HTTPS URL.', 400, 'INVALID_URL');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new AppError('Only HTTP and HTTPS URLs can be analyzed.', 400, 'UNSUPPORTED_PROTOCOL');
  }

  if (url.username || url.password) {
    throw new AppError('URLs with embedded credentials are not allowed.', 400, 'URL_CREDENTIALS_BLOCKED');
  }

  url.hash = '';
  return url;
}

export function resolveRedirectUrl(location, baseUrl) {
  if (!location || typeof location !== 'string') {
    throw new AppError('Redirect response did not include a valid Location header.', 502, 'MISSING_LOCATION');
  }

  let resolved;
  try {
    resolved = new URL(location, baseUrl);
  } catch {
    throw new AppError('Redirect target is not a valid URL.', 502, 'INVALID_REDIRECT_LOCATION');
  }

  return normalizeInputUrl(resolved.href, { allowProtocolFallback: false });
}
