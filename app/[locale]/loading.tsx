export default function Loading() {
  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
      {/* Mission Section Skeleton */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] px-6 py-16 sm:px-16 animate-pulse">
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
  );
}
