import { AlertTriangle, X } from 'lucide-react';

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-danger shadow-soft">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
        <p className="min-w-0 flex-1 text-sm font-semibold leading-6">{message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-danger transition hover:bg-red-100"
          aria-label="Dismiss error"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
