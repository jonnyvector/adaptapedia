'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import type { Work, ScreenWork } from '@/lib/types';
import AddDiffForm from '@/components/diff/AddDiffForm';

interface PageProps {
  params: {
    book: string;
    screen: string;
  };
}

export default function AddDiffPage({ params }: PageProps): JSX.Element {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [work, setWork] = useState<Work | null>(null);
  const [screenWork, setScreenWork] = useState<ScreenWork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?returnUrl=/compare/${params.book}/${params.screen}/add`);
      return;
    }

    // Fetch work and screen work data
    const fetchData = async (): Promise<void> => {
      try {
        const [workData, screenWorkData] = await Promise.all([
          api.works.get(params.book),
          api.screen.get(params.screen),
        ]);
        setWork(workData as Work);
        setScreenWork(screenWorkData as ScreenWork);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load comparison data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, isLoading, params.book, params.screen, router]);

  if (isLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.push(`/compare/${params.book}/${params.screen}`)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Comparison
          </button>
        </div>
      </main>
    );
  }

  if (!work || !screenWork) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-muted">Loading data...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8">
      <AddDiffForm work={work} screenWork={screenWork} />
    </main>
  );
}
