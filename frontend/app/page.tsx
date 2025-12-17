export default function Home(): JSX.Element {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Adaptapedia</h1>
        <p className="text-xl text-muted mb-8">
          Compare books and their screen adaptations
        </p>

        <div className="border border-border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
          <p className="text-muted">
            Search and comparison features will be available once the backend is running.
          </p>
        </div>
      </div>
    </main>
  );
}
