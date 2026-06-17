import { Clock3, ExternalLink, Globe2, Link2, Route } from 'lucide-react';
import { compactUrl, formatMs } from '../utils/format.js';

function Stat({ icon: Icon, label, value, tone = 'text-ink' }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-slateText">
        <Icon size={15} aria-hidden="true" />
        {label}
      </div>
      <p className={`break-words text-sm font-semibold leading-6 ${tone}`}>{value}</p>
    </div>
  );
}

export default function ResultsCard({ result }) {
  if (!result) {
    return null;
  }

  const domain = result.domainInfo?.final;

  return (
    <section className="rounded-lg border border-line bg-panel p-5 shadow-panel">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Analysis result</h2>
          <p className="mt-1 text-sm text-slateText">
            {result.domainInfo?.detectedProvider || 'Standard redirect'} analysis completed.
          </p>
        </div>
        <a
          href={result.finalUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink transition hover:border-ink"
        >
          <ExternalLink size={16} aria-hidden="true" />
          Open final URL
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Link2} label="Original URL" value={compactUrl(result.originalUrl)} />
        <Stat icon={Route} label="Redirects" value={`${result.redirectCount} hop${result.redirectCount === 1 ? '' : 's'}`} />
        <Stat icon={Clock3} label="Response time" value={formatMs(result.responseTimeMs)} tone="text-ocean" />
        <Stat icon={Globe2} label="Final domain" value={domain?.registrableDomain || domain?.hostname || 'Unknown'} />
      </div>

      <div className="mt-4 rounded-lg border border-line bg-slate-50 p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-slateText">Final destination</p>
            <p className="mt-1 break-words text-sm font-semibold leading-6 text-ink">{result.finalUrl}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-slateText">Status</p>
            <p className="mt-1 text-sm font-semibold text-ink">{result.finalStatusCode || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-slateText">Domain info</p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {domain?.subdomain ? `${domain.subdomain}.` : ''}
              {domain?.registrableDomain || domain?.hostname}
            </p>
            <p className="mt-1 text-xs text-slateText">
              {domain?.protocol?.toUpperCase()} port {domain?.port}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
