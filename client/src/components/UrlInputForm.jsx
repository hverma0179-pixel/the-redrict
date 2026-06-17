import { Loader2, Search, ShieldCheck } from 'lucide-react';
import { isProbablyUrl } from '../utils/format.js';

export default function UrlInputForm({ value, onChange, onAnalyze, loading }) {
  const valid = !value || isProbablyUrl(value);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!loading && valid && value.trim()) {
      onAnalyze(value.trim());
    }
  };

  return (
    <section className="rounded-lg border border-line bg-panel p-5 shadow-panel">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Analyze redirect chain</h2>
          <p className="mt-1 text-sm leading-6 text-slateText">
            Standard 301, 302, 303, 307, and 308 hops are traced with network safety checks.
          </p>
        </div>
        <div className="hidden rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-success sm:block">
          <ShieldCheck size={20} aria-hidden="true" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="url-input" className="block text-sm font-semibold text-ink">
          URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="url-input"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://example.com/short-link"
            className={`min-h-12 flex-1 rounded-lg border bg-white px-4 text-sm text-ink shadow-sm transition placeholder:text-slate-400 ${
              valid ? 'border-line focus:border-signal' : 'border-red-300 focus:border-danger'
            }`}
          />
          <button
            type="submit"
            disabled={loading || !value.trim() || !valid}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
            Analyze
          </button>
        </div>
        {!valid ? (
          <p className="text-sm font-medium text-danger">Enter a valid HTTP or HTTPS URL.</p>
        ) : null}
      </form>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {['VP Link', 'LinkPays', 'Generic short links'].map((label) => (
          <div key={label} className="rounded-lg border border-line bg-slate-50 px-3 py-2 text-sm font-semibold text-slateText">
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}
