export default function LoadingAnalysis() {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-white shadow-panel">
      <div className="relative h-1 bg-slate-100">
        <div className="scan-line absolute inset-y-0 left-0 w-1/2 bg-ocean" />
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="space-y-3 rounded-lg border border-line bg-slate-50 p-4">
            <div className="h-3 w-20 rounded bg-slate-200" />
            <div className="h-6 w-28 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="space-y-3 border-t border-line p-5">
        <div className="h-4 w-48 rounded bg-slate-200" />
        <div className="h-16 rounded-lg bg-slate-100" />
        <div className="h-16 rounded-lg bg-slate-100" />
      </div>
    </section>
  );
}
