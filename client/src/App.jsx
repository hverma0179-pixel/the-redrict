import { useEffect, useMemo, useState } from 'react';
import AppHeader from './components/AppHeader.jsx';
import AuthPanel from './components/AuthPanel.jsx';
import ErrorBanner from './components/ErrorBanner.jsx';
import HistoryTable from './components/HistoryTable.jsx';
import LoadingAnalysis from './components/LoadingAnalysis.jsx';
import RedirectTimeline from './components/RedirectTimeline.jsx';
import ResultsCard from './components/ResultsCard.jsx';
import UrlInputForm from './components/UrlInputForm.jsx';
import {
  analyzeUrl,
  clearHistory,
  getHistory,
  getMe,
  loginUser,
  registerUser
} from './api/client.js';
import { isProbablyUrl } from './utils/format.js';

const TOKEN_KEY = 'url-redirect-analyzer-token';

export default function App() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');

  const isLoggedIn = useMemo(() => Boolean(token && user), [token, user]);

  async function refreshHistory(activeToken = token) {
    if (!activeToken) {
      setHistory([]);
      return;
    }

    const data = await getHistory(activeToken);
    setHistory(data);
  }

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession() {
      if (!token) {
        return;
      }

      try {
        const data = await getMe(token);
        if (!cancelled) {
          setUser(data.user);
          await refreshHistory(token);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        if (!cancelled) {
          setToken('');
          setUser(null);
          setHistory([]);
        }
      }
    }

    hydrateSession();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleAnalyze(nextUrl = url) {
    const cleanUrl = nextUrl.trim();
    setError('');

    if (!isProbablyUrl(cleanUrl)) {
      setError('Enter a valid HTTP or HTTPS URL.');
      return;
    }

    setLoading(true);
    try {
      const data = await analyzeUrl(cleanUrl, token || undefined);
      setResult(data);
      setUrl(cleanUrl);
      if (token) {
        await refreshHistory(token);
      }
    } catch (apiError) {
      setError(apiError.message || 'Unable to analyze this URL.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setError('');
    setAuthLoading(true);

    try {
      const payload =
        authMode === 'register'
          ? await registerUser(authForm)
          : await loginUser({ email: authForm.email, password: authForm.password });

      localStorage.setItem(TOKEN_KEY, payload.token);
      setToken(payload.token);
      setUser(payload.user);
      setAuthForm({ name: '', email: '', password: '' });
      await refreshHistory(payload.token);
    } catch (apiError) {
      setError(apiError.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setUser(null);
    setHistory([]);
  }

  async function handleClearHistory() {
    if (!token) {
      return;
    }

    setError('');
    try {
      await clearHistory(token);
      setHistory([]);
    } catch (apiError) {
      setError(apiError.message || 'Unable to clear history.');
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader user={user} onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <UrlInputForm value={url} onChange={setUrl} onAnalyze={handleAnalyze} loading={loading} />
          <AuthPanel
            mode={authMode}
            setMode={setAuthMode}
            form={authForm}
            setForm={setAuthForm}
            onSubmit={handleAuthSubmit}
            loading={authLoading}
            user={user}
          />
        </div>

        <div className="mt-5">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>

        <div className="mt-5 space-y-5">
          {loading ? <LoadingAnalysis /> : null}
          {!loading && result ? (
            <>
              <ResultsCard result={result} />
              <RedirectTimeline chain={result.chain} />
            </>
          ) : null}
          <HistoryTable
            history={history}
            user={isLoggedIn ? user : null}
            onAnalyzeAgain={handleAnalyze}
            onClear={handleClearHistory}
          />
        </div>
      </main>
    </div>
  );
}
