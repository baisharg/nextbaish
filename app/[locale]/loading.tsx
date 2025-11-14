export default function Loading() {
  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl px-6 py-16 sm:px-10">
      <div className="main-sections">
      {/* Mission Section Skeleton */}
      <section className="section-container animate-pulse">
        <div className="space-y-6 max-w-3xl">
          <div className="h-4 w-32 bg-slate-300 rounded" />
          <div className="h-12 w-full bg-slate-300 rounded" />
          <div className="space-y-4">
            <div className="h-6 w-full bg-slate-300 rounded" />
            <div className="h-6 w-full bg-slate-300 rounded" />
            <div className="h-6 w-3/4 bg-slate-300 rounded" />
          </div>
          <div className="h-12 w-40 bg-slate-300 rounded-full" />
        </div>
      </section>
      </div>
    </div>
  );
}
