export default function Loading(): JSX.Element {
  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="mb-6">
            <div className="h-10 w-2/3 bg-muted/20 rounded mb-2 animate-pulse" />
            <div className="h-6 w-32 bg-muted/20 rounded animate-pulse" />
          </div>
          <div className="h-24 w-full bg-muted/20 rounded animate-pulse" />
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Adaptations Skeleton */}
            <div>
              <div className="h-8 w-64 bg-muted/20 rounded mb-4 animate-pulse" />
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="border border-border rounded-lg p-5"
                  >
                    <div className="h-6 w-3/4 bg-muted/20 rounded mb-3 animate-pulse" />
                    <div className="h-4 w-1/4 bg-muted/20 rounded mb-4 animate-pulse" />
                    <div className="h-16 w-full bg-muted/20 rounded mb-4 animate-pulse" />
                    <div className="h-10 w-40 bg-muted/20 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-lg p-5">
              <div className="h-6 w-32 bg-muted/20 rounded mb-4 animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 w-full bg-muted/20 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
