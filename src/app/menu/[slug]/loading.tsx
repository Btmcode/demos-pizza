/**
 * Menu detail page loading skeleton
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="h-6 w-48 bg-ink/10 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          <div className="aspect-square rounded-3xl bg-ink/10 animate-pulse" />
          <div className="space-y-4">
            <div className="h-10 w-3/4 bg-ink/10 rounded animate-pulse" />
            <div className="h-6 w-1/2 bg-ink/10 rounded animate-pulse" />
            <div className="h-24 w-full bg-ink/10 rounded animate-pulse" />
            <div className="h-12 w-full bg-ink/10 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
