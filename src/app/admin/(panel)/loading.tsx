export default function AdminLoading() {
  return (
    <div>
      <div className="h-8 w-56 animate-pulse rounded-xl bg-white/[0.07]" />
      <div className="mt-3 h-4 w-80 animate-pulse rounded-full bg-white/5" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-xl bg-white/[0.04]" />
        ))}
      </div>
      <div className="mt-6 h-64 animate-pulse rounded-2xl bg-white/[0.03]" />
    </div>
  );
}
