import { History, RefreshCcw, Trash2 } from 'lucide-react';
import { compactUrl, formatDate, formatMs } from '../utils/format.js';

export default function HistoryTable({ history, user, onAnalyzeAgain, onClear }) {
  return (
    <section className="rounded-lg border border-line bg-panel p-5 shadow-panel">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-signal">
            <History size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Search history</h2>
            <p className="mt-1 text-sm text-slateText">
              {user ? `${history.length} saved result${history.length === 1 ? '' : 's'}` : 'Login required'}
            </p>
          </div>
        </div>
        {user && history.length ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-slateText transition hover:border-danger hover:text-danger"
          >
            <Trash2 size={16} aria-hidden="true" />
            Clear
          </button>
        ) : null}
      </div>

      {!user ? (
        <div className="rounded-lg border border-dashed border-line bg-slate-50 p-6 text-sm text-slateText">
          History appears here after login.
        </div>
      ) : history.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-normal text-slateText">
                <th className="py-3 pr-4 font-semibold">Original</th>
                <th className="py-3 pr-4 font-semibold">Final</th>
                <th className="py-3 pr-4 font-semibold">Hops</th>
                <th className="py-3 pr-4 font-semibold">Time</th>
                <th className="py-3 pr-4 font-semibold">Saved</th>
                <th className="py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item._id} className="border-b border-line last:border-b-0">
                  <td className="py-3 pr-4 font-medium text-ink">{compactUrl(item.originalUrl, 44)}</td>
                  <td className="py-3 pr-4 text-slateText">{compactUrl(item.finalUrl, 44)}</td>
                  <td className="py-3 pr-4 text-slateText">{item.redirectCount}</td>
                  <td className="py-3 pr-4 text-slateText">{formatMs(item.responseTimeMs)}</td>
                  <td className="py-3 pr-4 text-slateText">{formatDate(item.createdAt)}</td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => onAnalyzeAgain(item.originalUrl)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-slateText transition hover:border-ink hover:text-ink"
                      title="Analyze again"
                      aria-label="Analyze again"
                    >
                      <RefreshCcw size={15} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-line bg-slate-50 p-6 text-sm text-slateText">
          No saved analyses yet.
        </div>
      )}
    </section>
  );
}
