import dns from 'node:dns/promises';
import net from 'node:net';
import ipaddr from 'ipaddr.js';
import { AppError } from './AppError.js';

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  '0.0.0.0'
]);

const BLOCKED_SUFFIXES = [
  '.localhost',
  '.local',
  '.internal',
  '.test',
  '.invalid',
  '.home.arpa'
];

function cleanHostname(hostname) {
  return hostname
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .replace(/\.$/, '')
    .toLowerCase();
}

export function isBlockedAddress(address) {
  let parsed;

  try {
    parsed = ipaddr.parse(address);
  } catch {
    return true;
  }

  if (parsed.kind() === 'ipv6' && parsed.isIPv4MappedAddress()) {
    parsed = parsed.toIPv4Address();
  }

  return parsed.range() !== 'unicast';
}

function assertPublicHostname(hostname) {
  const cleaned = cleanHostname(hostname);

  if (!cleaned || cleaned.includes('%')) {
    throw new AppError('The target hostname is not allowed.', 400, 'HOSTNAME_BLOCKED');
  }

  if (BLOCKED_HOSTNAMES.has(cleaned) || BLOCKED_SUFFIXES.some((suffix) => cleaned.endsWith(suffix))) {
    throw new AppError('Local or private hostnames are blocked.', 400, 'HOSTNAME_BLOCKED');
  }

  return cleaned;
}

export async function assertSafeUrl(url) {
  const hostname = assertPublicHostname(url.hostname);

  if (net.isIP(hostname)) {
    if (isBlockedAddress(hostname)) {
      throw new AppError('Local or private IP addresses are blocked.', 400, 'IP_BLOCKED');
    }
    return [{ address: hostname, family: net.isIP(hostname) }];
  }

  let records;
  try {
    records = await dns.lookup(hostname, { all: true, verbatim: false });
  } catch {
    throw new AppError('Unable to resolve the target hostname.', 400, 'DNS_LOOKUP_FAILED');
  }

  if (!records.length) {
    throw new AppError('The target hostname did not resolve.', 400, 'DNS_LOOKUP_EMPTY');
  }

  const blocked = records.find((record) => isBlockedAddress(record.address));
  if (blocked) {
    throw new AppError('The target resolves to a blocked network address.', 400, 'IP_BLOCKED');
  }

  return records;
}

export function safeLookup(hostname, options, callback) {
  const cb = typeof options === 'function' ? options : callback;
  const opts = typeof options === 'function' ? {} : options || {};

  Promise.resolve()
    .then(async () => {
      const cleaned = assertPublicHostname(hostname);
      const records = await dns.lookup(cleaned, {
        all: true,
        family: opts.family || 0,
        hints: opts.hints,
        verbatim: false
      });

      const blocked = records.find((record) => isBlockedAddress(record.address));
      if (blocked) {
        throw new AppError('The target resolves to a blocked network address.', 400, 'IP_BLOCKED');
      }

      if (opts.all) {
        cb(null, records);
        return;
      }

      const first = records[0];
      cb(null, first.address, first.family);
    })
    .catch((error) => cb(error));
}
