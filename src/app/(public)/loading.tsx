export default function PublicLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-28 sm:px-8">
      <div className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
      <div className="mt-6 h-12 w-3/4 animate-pulse rounded-2xl bg-white/[0.07]" />
      <div className="mt-4 h-4 w-2/3 animate-pulse rounded-full bg-white/5" />
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-40 animate-pulse rounded-2xl bg-white/[0.03]" />
        ))}
      </div>
    </div>
  );
}
