import net from 'node:net';
import { parse } from 'tldts';

const providerMatchers = [
  {
    name: 'VP Link',
    patterns: [/(^|\.)vplinks?\./i, /(^|\.)vp-link\./i, /vplink/i]
  },
  {
    name: 'LinkPays',
    patterns: [/(^|\.)linkpays?\./i, /linkpays/i, /linkpay/i]
  }
];

export function detectProvider(hostname = '') {
  const normalized = hostname.toLowerCase();
  const match = providerMatchers.find((provider) =>
    provider.patterns.some((pattern) => pattern.test(normalized))
  );
  return match?.name || null;
}

export function getDomainInfo(url) {
  const parsed = parse(url.hostname);
  const hostForIp = url.hostname.replace(/^\[/, '').replace(/\]$/, '');

  return {
    hostname: url.hostname,
    protocol: url.protocol.replace(':', ''),
    port: url.port || (url.protocol === 'https:' ? '443' : '80'),
    registrableDomain: parsed.domain || url.hostname,
    subdomain: parsed.subdomain || '',
    publicSuffix: parsed.publicSuffix || '',
    isIpAddress: net.isIP(hostForIp) !== 0,
    provider: detectProvider(url.hostname)
  };
}
