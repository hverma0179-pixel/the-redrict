const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      payload.error?.message || 'Request failed.',
      payload.error?.code || 'REQUEST_FAILED',
      response.status
    );
  }

  return payload.data;
}

export function analyzeUrl(url, token) {
  return apiFetch('/api/analyze', {
    method: 'POST',
    body: { url },
    token
  });
}

export function registerUser(form) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: form
  });
}

export function loginUser(form) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: form
  });
}

export function getMe(token) {
  return apiFetch('/api/auth/me', { token });
}

export function getHistory(token) {
  return apiFetch('/api/history', { token });
}

export function clearHistory(token) {
  return apiFetch('/api/history', {
    method: 'DELETE',
    token
  });
}
