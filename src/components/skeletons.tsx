export function DashboardSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="h-16 animate-pulse rounded-3xl bg-surface-2" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-28 animate-pulse rounded-3xl bg-surface-2" />
        <div className="h-28 animate-pulse rounded-3xl bg-surface-2" />
        <div className="h-28 animate-pulse rounded-3xl bg-surface-2" />
      </div>
      <div className="h-64 animate-pulse rounded-3xl bg-surface-2" />
      <div className="h-72 animate-pulse rounded-3xl bg-surface-2" />
    </div>
  );
}

export function PortfolioSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-28 animate-pulse rounded-3xl bg-surface-2" />
        <div className="h-28 animate-pulse rounded-3xl bg-surface-2" />
        <div className="h-28 animate-pulse rounded-3xl bg-surface-2" />
      </div>
      <div className="h-72 animate-pulse rounded-3xl bg-surface-2" />
      <div className="h-64 animate-pulse rounded-3xl bg-surface-2" />
    </div>
  );
}

export function ChartSkeleton() {
  return <div className="h-64 animate-pulse rounded-3xl bg-surface-2" />;
}
