export function formatMs(value) {
  if (!Number.isFinite(value)) {
    return '0 ms';
  }
  return value >= 1000 ? `${(value / 1000).toFixed(2)} s` : `${value} ms`;
}

export function formatDate(value) {
  if (!value) {
    return '';
  }
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

export function isProbablyUrl(value) {
  if (!value || /\s/.test(value)) {
    return false;
  }

  try {
    const candidate = /^[a-z][a-z\d+\-.]*:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(candidate);
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function compactUrl(value, maxLength = 76) {
  if (!value || value.length <= maxLength) {
    return value || '';
  }
  const head = value.slice(0, Math.floor(maxLength * 0.58));
  const tail = value.slice(-Math.floor(maxLength * 0.28));
  return `${head}...${tail}`;
}
