/**
 * Loading skeleton — sayfa geçişlerinde anlık görünür
 * Gecikme hissini ortadan kaldırır
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Header skeleton */}
      <div className="h-[88px] bg-ink animate-pulse" />

      {/* Content skeleton */}
      <div className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <div className="space-y-6">
          {/* Hero skeleton */}
          <div className="h-64 md:h-80 rounded-2xl bg-ink/10 animate-pulse" />

          {/* Menu section skeleton */}
          <div className="space-y-3">
            <div className="h-8 w-48 bg-ink/10 rounded-lg animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-48 rounded-2xl bg-ink/10 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
