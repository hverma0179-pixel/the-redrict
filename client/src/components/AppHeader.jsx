import { Link2, LogOut, ShieldCheck } from 'lucide-react';

export default function AppHeader({ user, onLogout }) {
  return (
    <header className="border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ocean text-white shadow-soft">
            <Link2 size={22} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-normal text-ink sm:text-xl">
              URL Redirect Analyzer
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slateText">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={14} aria-hidden="true" />
                SSRF Guard Active
              </span>
              <span>VP Link</span>
              <span>LinkPays</span>
            </div>
          </div>
        </div>

        {user ? (
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-ink">{user.name}</p>
              <p className="text-xs text-slateText">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white text-slateText transition hover:border-ink hover:text-ink"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
