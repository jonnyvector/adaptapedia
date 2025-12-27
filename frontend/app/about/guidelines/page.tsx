import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Guidelines - Book vs. Movie',
  description: 'Guidelines for contributing to Book vs. Movie',
};

export default function GuidelinesPage(): JSX.Element {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Community Guidelines</h1>
          <p className="text-xl text-muted">
            Guidelines for contributing to Adaptapedia
          </p>
        </div>

        {/* Placeholder Content */}
        <section className="mb-12">
          <div className="border border-border rounded-lg p-8 bg-muted/5">
            <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
            <p className="text-lg text-muted">
              Our community guidelines are currently being developed. This page will include
              detailed information about how to contribute effectively to Adaptapedia, including
              standards for documenting differences, voting guidelines, and community conduct
              expectations.
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
