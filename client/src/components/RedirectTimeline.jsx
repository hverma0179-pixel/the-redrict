import { ArrowRight, CheckCircle2, CornerDownRight } from 'lucide-react';
import { compactUrl, formatMs } from '../utils/format.js';

function statusTone(statusCode) {
  if (statusCode >= 200 && statusCode < 300) {
    return 'border-emerald-200 bg-emerald-50 text-success';
  }
  if (statusCode >= 300 && statusCode < 400) {
    return 'border-amber-200 bg-amber-50 text-caution';
  }
  if (statusCode >= 400) {
    return 'border-red-200 bg-red-50 text-danger';
  }
  return 'border-slate-200 bg-slate-50 text-slateText';
}

export default function RedirectTimeline({ chain = [] }) {
  if (!chain.length) {
    return null;
  }

  return (
    <section className="rounded-lg border border-line bg-panel p-5 shadow-panel">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Redirect timeline</h2>
          <p className="mt-1 text-sm text-slateText">{chain.length} network step{chain.length === 1 ? '' : 's'}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-ocean">
          <CornerDownRight size={20} aria-hidden="true" />
        </div>
      </div>

      <ol className="space-y-4">
        {chain.map((step, index) => (
          <li key={`${step.url}-${step.hop}`} className="grid gap-3 rounded-lg border border-line bg-white p-4 md:grid-cols-[auto_1fr_auto] md:items-start">
            <div className="flex items-center gap-3 md:block">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-sm font-bold text-white">
                {index + 1}
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-md border px-2 py-1 text-xs font-bold ${statusTone(step.statusCode)}`}>
                  {step.statusCode || 'ERR'}
                </span>
                <span className="text-sm font-semibold text-ink">{step.statusText || 'Response received'}</span>
                <span className="text-xs font-medium text-slateText">{formatMs(step.durationMs)}</span>
              </div>
              <p className="mt-3 break-words text-sm leading-6 text-slateText">{compactUrl(step.url, 120)}</p>
              {step.redirectTo ? (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slateText">
                  <ArrowRight className="mt-0.5 shrink-0 text-caution" size={16} aria-hidden="true" />
                  <span className="break-words">{compactUrl(step.redirectTo, 120)}</span>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-success">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Final reachable response
                </div>
              )}
            </div>
            <div className="rounded-lg border border-line bg-slate-50 px-3 py-2 text-xs text-slateText md:text-right">
              <p className="font-semibold text-ink">{step.domain?.hostname}</p>
              <p>{step.domain?.provider || step.domain?.registrableDomain || 'Domain'}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
