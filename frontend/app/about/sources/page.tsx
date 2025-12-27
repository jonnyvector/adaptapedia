import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Sources & Attribution - Book vs. Movie',
  description: 'Learn about the open data sources that power Book vs. Movie, including TMDb, Wikidata, and Open Library',
};

export default function DataSourcesPage(): JSX.Element {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Data Sources & Attribution</h1>
          <p className="text-xl text-muted">
            Adaptapedia aggregates data from multiple open sources to provide comprehensive
            information about book adaptations.
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-12">
          <div className="border border-border rounded-lg p-8 bg-muted/5">
            <p className="text-lg">
              We believe in open data and attribution. All of our data comes from publicly
              available sources with open licenses. This page documents those sources and
              provides the required legal attributions.
            </p>
          </div>
        </section>

        {/* The Movie Database (TMDb) */}
        <section className="mb-12">
          <div className="border border-border rounded-lg p-8">
            <div className="flex items-start gap-6 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-2">The Movie Database (TMDb)</h2>
                <a
                  href="https://www.themoviedb.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link hover:underline text-sm"
                >
                  themoviedb.org
                </a>
              </div>
              {/* Placeholder for TMDb logo */}
              <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-xs text-muted text-center p-2">
                TMDb Logo
                <br />
                (to be added)
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What We Use</h3>
                <p className="text-muted">
                  TMDb provides comprehensive movie and TV show metadata, including posters,
                  release dates, cast information, plot summaries, and production details.
                  This data powers the screen adaptation side of our comparisons.
                </p>
              </div>

              <div className="bg-muted/10 border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Required Attribution</h3>
                <p className="text-sm">
                  This product uses the TMDb API but is not endorsed or certified by TMDb.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">License & Terms</h3>
                <p className="text-muted mb-2">
                  TMDb data is provided via their API under specific terms of use.
                </p>
                <a
                  href="https://www.themoviedb.org/terms-of-use"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link hover:underline text-sm"
                >
                  View TMDb Terms of Use
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Wikidata */}
        <section className="mb-12">
          <div className="border border-border rounded-lg p-8">
            <div className="flex items-start gap-6 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-2">Wikidata</h2>
                <a
                  href="https://www.wikidata.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link hover:underline text-sm"
                >
                  wikidata.org
                </a>
              </div>
              {/* Placeholder for Wikidata logo */}
              <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-xs text-muted text-center p-2">
                Wikidata Logo
                <br />
                (to be added)
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What We Use</h3>
                <p className="text-muted">
                  Wikidata provides the core relationship data that links books to their screen
                  adaptations. It's a free, collaborative knowledge base that serves as central
                  storage for structured data across Wikimedia projects and beyond.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">License</h3>
                <p className="text-muted mb-2">
                  All Wikidata content is available under the Creative Commons CC0 license,
                  which places the data in the public domain.
                </p>
                <div className="flex gap-4 text-sm">
                  <a
                    href="https://www.wikidata.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link hover:underline"
                  >
                    Visit Wikidata
                  </a>
                  <a
                    href="https://creativecommons.org/publicdomain/zero/1.0/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link hover:underline"
                  >
                    CC0 License Details
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Open Library */}
        <section className="mb-12">
          <div className="border border-border rounded-lg p-8">
            <div className="flex items-start gap-6 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-2">Open Library</h2>
                <a
                  href="https://openlibrary.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link hover:underline text-sm"
                >
                  openlibrary.org
                </a>
              </div>
              {/* Placeholder for Open Library logo */}
              <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-xs text-muted text-center p-2">
                Open Library Logo
                <br />
                (to be added)
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What We Use</h3>
                <p className="text-muted">
                  Open Library provides extensive book metadata including cover images, publication
                  dates, author information, editions, and ISBN data. As an Internet Archive project,
                  it aims to create "one web page for every book ever published."
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">License</h3>
                <p className="text-muted mb-2">
                  Open Library data is available under the Creative Commons CC0 license,
                  placing it in the public domain for free use.
                </p>
                <div className="flex gap-4 text-sm">
                  <a
                    href="https://openlibrary.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link hover:underline"
                  >
                    Visit Open Library
                  </a>
                  <a
                    href="https://creativecommons.org/publicdomain/zero/1.0/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link hover:underline"
                  >
                    CC0 License Details
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Contributions */}
        <section className="mb-12">
          <div className="border border-border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Community Contributions</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">User-Generated Content</h3>
                <p className="text-muted">
                  Beyond third-party data sources, Adaptapedia relies on contributions from our
                  community of readers and viewers. This includes:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1 text-muted">
                  <li>Documented differences between books and adaptations</li>
                  <li>Accuracy votes and ratings</li>
                  <li>Comments providing context and nuance</li>
                  <li>Suggested corrections and improvements</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Moderation</h3>
                <p className="text-muted">
                  All user-generated content is moderated to ensure quality, accuracy, and
                  adherence to our community standards.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Contributing</h3>
                <p className="text-muted mb-2">
                  Interested in contributing? Learn more about how to participate effectively:
                </p>
                <Link
                  href="/about/guidelines"
                  className="text-link hover:underline text-sm"
                >
                  Read Community Guidelines
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-12">
          <div className="border border-border rounded-lg p-8 bg-muted/5">
            <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
            <p className="text-lg text-muted mb-4">
              We are committed to transparency in our data sources and proper attribution
              for all content. If you have questions about our data sources or notice any
              attribution issues, please contact us.
            </p>
            <p className="text-muted">
              All external data is used in accordance with the respective terms of service
              and licenses. We regularly review and update our attributions to ensure compliance.
            </p>
          </div>
        </section>

        {/* Navigation Links */}
        <div className="flex justify-between items-center pt-8 border-t border-border">
          <Link href="/about" className="text-link hover:underline">
            &larr; Back to About
          </Link>
          <Link href="/" className="text-link hover:underline">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
