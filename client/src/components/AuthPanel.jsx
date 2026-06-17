import { LockKeyhole, LogIn, UserPlus } from 'lucide-react';

export default function AuthPanel({
  mode,
  setMode,
  form,
  setForm,
  onSubmit,
  loading,
  user
}) {
  if (user) {
    return (
      <section className="rounded-lg border border-line bg-panel p-5 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-signal">
            <LockKeyhole size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">History enabled</h2>
            <p className="mt-1 text-sm text-slateText">New analyses are saved to your account.</p>
          </div>
        </div>
      </section>
    );
  }

  const isRegister = mode === 'register';

  return (
    <section className="rounded-lg border border-line bg-panel p-5 shadow-panel">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Account</h2>
          <p className="mt-1 text-sm text-slateText">Log in to keep search history.</p>
        </div>
        <div className="flex rounded-lg border border-line bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              !isRegister ? 'bg-white text-ink shadow-sm' : 'text-slateText'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              isRegister ? 'bg-white text-ink shadow-sm' : 'text-slateText'
            }`}
          >
            Register
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {isRegister ? (
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Name"
            className="min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink placeholder:text-slate-400"
          />
        ) : null}
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          placeholder="Email"
          className="min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink placeholder:text-slate-400"
        />
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          placeholder="Password"
          className="min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-ocean px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isRegister ? <UserPlus size={17} aria-hidden="true" /> : <LogIn size={17} aria-hidden="true" />}
          {isRegister ? 'Create account' : 'Log in'}
        </button>
      </form>
    </section>
  );
}
