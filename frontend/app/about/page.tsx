import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Adaptapedia',
  description: 'Learn about Adaptapedia, a community-driven wiki for comparing books and their screen adaptations',
};

export default function AboutPage(): JSX.Element {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">About Adaptapedia</h1>
          <p className="text-xl text-muted">
            A community-driven wiki for comparing books and their screen adaptations
          </p>
        </div>

        {/* Mission Statement */}
        <section className="mb-12">
          <div className="border border-border rounded-lg p-8 bg-muted/5">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-lg mb-4">
              Adaptapedia exists to document and explore how stories transform when they move from
              page to screen. We believe in the value of both books and their adaptations, and our
              goal is to help readers and viewers understand the creative choices, changes, and
              differences that occur in the adaptation process.
            </p>
            <p className="text-lg text-muted">
              Whether you're deciding what to read or watch next, or simply curious about how
              your favorite stories changed in translation, Adaptapedia is here to help.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">How It Works</h2>

          <div className="space-y-6">
            <div className="border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Structured Comparisons</h3>
              <p className="text-muted">
                Our comparison pages organize differences into clear categories: Plot Changes,
                Character Changes, Setting Changes, and Theme Changes. Each difference is documented
                with context from both the book and the screen adaptation.
              </p>
            </div>

            <div className="border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Spoiler Protection System</h3>
              <p className="text-muted mb-4">
                We understand that spoilers matter. Our spoiler scope system lets you control
                what you see:
              </p>
              <ul className="space-y-2 text-muted ml-6 list-disc">
                <li><strong>None:</strong> No spoilers - safe for those who haven't experienced either work</li>
                <li><strong>Beginning:</strong> First act spoilers only</li>
                <li><strong>Middle:</strong> Includes second act spoilers</li>
                <li><strong>End:</strong> Everything, including endings and major reveals</li>
              </ul>
            </div>

            <div className="border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Community-Driven</h3>
              <p className="text-muted mb-4">
                Adaptapedia relies on contributions from readers and viewers like you. Our
                community helps by:
              </p>
              <ul className="space-y-2 text-muted ml-6 list-disc">
                <li>Documenting differences between books and adaptations</li>
                <li>Voting on the accuracy of existing comparisons</li>
                <li>Adding context and nuance through comments</li>
                <li>Suggesting improvements and corrections</li>
              </ul>
              <p className="text-muted mt-4">
                All contributions are moderated to ensure quality and accuracy.{' '}
                <Link href="/about/guidelines" className="text-link hover:underline">
                  Read our community guidelines
                </Link>
                .
              </p>
            </div>

            <div className="border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Comprehensive Data</h3>
              <p className="text-muted">
                Our database includes over 2,185 books and 3,417 screen adaptations, with
                detailed metadata sourced from{' '}
                <Link href="/about/sources" className="text-link hover:underline">
                  trusted open data sources
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Open Source */}
        <section className="mb-12">
          <div className="border border-border rounded-lg p-8 bg-muted/5">
            <h2 className="text-2xl font-semibold mb-4">Open Source</h2>
            <p className="text-lg text-muted mb-4">
              Adaptapedia is an open-source project. You can view our code, report issues,
              or contribute to the project on GitHub.
            </p>
            <a
              href="https://github.com/adaptapedia/adaptapedia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              View on GitHub
            </a>
          </div>
        </section>

        {/* Footer Links */}
        <section>
          <div className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold mb-4">Learn More</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/about/sources"
                className="block p-6 border border-border rounded-lg hover:bg-muted/10 transition-colors"
              >
                <h3 className="font-semibold text-lg mb-2">Data Sources & Attribution</h3>
                <p className="text-sm text-muted">
                  Learn about the open data sources that power Adaptapedia
                </p>
              </Link>
              <Link
                href="/about/guidelines"
                className="block p-6 border border-border rounded-lg hover:bg-muted/10 transition-colors"
              >
                <h3 className="font-semibold text-lg mb-2">Community Guidelines</h3>
                <p className="text-sm text-muted">
                  Understand how to contribute effectively to Adaptapedia
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link href="/" className="text-link hover:underline">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
