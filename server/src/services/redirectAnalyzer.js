import http from 'node:http';
import https from 'node:https';
import { performance } from 'node:perf_hooks';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { getDomainInfo } from '../utils/domain.js';
import { assertSafeUrl, safeLookup } from '../utils/networkGuards.js';
import { normalizeInputUrl, resolveRedirectUrl } from '../utils/url.js';

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const USER_AGENT = 'URLRedirectAnalyzer/1.0';

function requestOnce(url) {
  const transport = url.protocol === 'https:' ? https : http;
  const started = performance.now();

  return new Promise((resolve, reject) => {
    let settled = false;

    const settle = (fn, value) => {
      if (settled) {
        return;
      }
      settled = true;
      fn(value);
    };

    const request = transport.request(
      url,
      {
        method: 'GET',
        lookup: safeLookup,
        timeout: env.REQUEST_TIMEOUT_MS,
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5',
          Connection: 'close',
          Range: 'bytes=0-0',
          'User-Agent': USER_AGENT
        }
      },
      (response) => {
        const durationMs = Math.round(performance.now() - started);
        const locationHeader = response.headers.location;
        const location = Array.isArray(locationHeader) ? locationHeader[0] : locationHeader;

        const result = {
          statusCode: response.statusCode || 0,
          statusText: response.statusMessage || '',
          headers: response.headers,
          location,
          durationMs
        };

        response.resume();
        response.destroy();
        settle(resolve, result);
      }
    );

    request.on('timeout', () => {
      request.destroy(new AppError('The target server timed out.', 504, 'REQUEST_TIMEOUT'));
    });

    request.on('error', (error) => {
      settle(
        reject,
        error instanceof AppError
          ? error
          : new AppError('Unable to fetch the URL safely.', 502, 'FETCH_FAILED', error.message)
      );
    });

    request.end();
  });
}

export async function analyzeRedirectChain(rawUrl) {
  const started = performance.now();
  const original = normalizeInputUrl(rawUrl);
  let current = original;
  const seen = new Set();
  const chain = [];
  let finalUrl = original;
  let finalStatusCode = 0;

  for (let hop = 0; hop <= env.MAX_REDIRECTS; hop += 1) {
    const currentHref = current.href;

    if (seen.has(currentHref)) {
      throw new AppError('A redirect loop was detected.', 400, 'REDIRECT_LOOP');
    }
    seen.add(currentHref);

    await assertSafeUrl(current);
    const response = await requestOnce(current);
    const domain = getDomainInfo(current);

    const step = {
      hop,
      url: currentHref,
      statusCode: response.statusCode,
      statusText: response.statusText,
      redirectTo: null,
      durationMs: response.durationMs,
      domain
    };

    if (REDIRECT_STATUSES.has(response.statusCode) && response.location) {
      const next = resolveRedirectUrl(response.location, current);
      await assertSafeUrl(next);
      step.redirectTo = next.href;
      chain.push(step);
      current = next;
      continue;
    }

    chain.push(step);
    finalUrl = current;
    finalStatusCode = response.statusCode;
    break;
  }

  if (chain.length > env.MAX_REDIRECTS && REDIRECT_STATUSES.has(chain.at(-1)?.statusCode)) {
    throw new AppError(`Redirect chain exceeded ${env.MAX_REDIRECTS} hops.`, 400, 'TOO_MANY_REDIRECTS');
  }

  const originalDomain = getDomainInfo(original);
  const finalDomain = getDomainInfo(finalUrl);
  const detectedProvider = originalDomain.provider || finalDomain.provider || null;
  const responseTimeMs = Math.round(performance.now() - started);

  return {
    originalUrl: original.href,
    finalUrl: finalUrl.href,
    finalStatusCode,
    redirectCount: chain.filter((step) => REDIRECT_STATUSES.has(step.statusCode)).length,
    responseTimeMs,
    chain,
    domainInfo: {
      original: originalDomain,
      final: finalDomain,
      sameRegistrableDomain:
        Boolean(originalDomain.registrableDomain) &&
        originalDomain.registrableDomain === finalDomain.registrableDomain,
      detectedProvider
    },
    notes: detectedProvider
      ? [
          `${detectedProvider} detected. Standard HTTP redirects were analyzed without bypassing protected or interactive flows.`
        ]
      : []
  };
}
