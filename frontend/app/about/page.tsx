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
          <div className="border border-border rounded-lg p-8 bg-surface">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br from-primary to-accent-violet flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              </div>
            </div>
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
            <div className="border border-border rounded-lg p-6 bg-surface">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Structured Comparisons</h3>
                  <p className="text-muted">
                    Our comparison pages organize differences into clear categories: Plot Changes,
                    Character Changes, Setting Changes, and Theme Changes. Each difference is documented
                    with context from both the book and the screen adaptation.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-6 bg-surface">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </div>
                <div>
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
              </div>
            </div>

            <div className="border border-border rounded-lg p-6 bg-surface">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
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
              </div>
            </div>

            <div className="border border-border rounded-lg p-6 bg-surface">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <div>
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
            </div>
          </div>
        </section>

        {/* Open Source */}
        <section className="mb-12">
          <div className="border border-border rounded-lg p-8 bg-surface">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold">Open Source</h2>
            </div>
            <p className="text-lg text-muted mb-4">
              Adaptapedia is an open-source project. You can view our code, report issues,
              or contribute to the project on GitHub.
            </p>
            <a
              href="https://github.com/adaptapedia/adaptapedia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
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
                className="block p-6 border border-border rounded-lg bg-surface hover:border-border-accent transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Data Sources & Attribution</h3>
                    <p className="text-sm text-muted">
                      Learn about the open data sources that power Adaptapedia
                    </p>
                  </div>
                </div>
              </Link>
              <Link
                href="/about/guidelines"
                className="block p-6 border border-border rounded-lg bg-surface hover:border-border-accent transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Community Guidelines</h3>
                    <p className="text-sm text-muted">
                      Understand how to contribute effectively to Adaptapedia
                    </p>
                  </div>
                </div>
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
