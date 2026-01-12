'use client';

import { useEffect, useState } from 'react';
import { FONTS, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';

interface AnalyticsData {
  totalEvents: number;
  pageviews: number;
  signups: number;
  logins: number;
  searches: number;
  diffVotes: number;
  comparisonViews: number;
  randomClicks: number;
  onboardingCompleted: number;
  topSearches: Array<{ query: string; count: number }>;
  topComparisons: Array<{ workTitle: string; screenWorkTitle: string; count: number }>;
  recentEvents: Array<{ event: string; timestamp: string; properties: any }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container py-8">
        <div className="text-center text-red-600">Error: {error || 'No data available'}</div>
      </div>
    );
  }

  return (
    <div className="container py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: FONTS.mono }}>
          Analytics Dashboard
        </h1>
        <p className={`${TEXT.secondary}`}>Last 1000 events from PostHog</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard label="Total Events" value={data.totalEvents} />
        <MetricCard label="Pageviews" value={data.pageviews} />
        <MetricCard label="Signups" value={data.signups} highlight />
        <MetricCard label="Searches" value={data.searches} />
        <MetricCard label="Diff Votes" value={data.diffVotes} />
        <MetricCard label="Comparisons" value={data.comparisonViews} />
        <MetricCard label="Random Clicks" value={data.randomClicks} />
        <MetricCard label="Logins" value={data.logins} />
        <MetricCard label="Onboarding" value={data.onboardingCompleted} highlight />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Searches */}
        <div className={`border ${BORDERS.medium} ${RADIUS.control} p-6 bg-white dark:bg-black`}>
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: FONTS.mono }}>
            Top Searches
          </h2>
          {data.topSearches.length > 0 ? (
            <div className="space-y-2">
              {data.topSearches.map((search, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className={TEXT.body}>{search.query}</span>
                  <span className={`${TEXT.secondary} font-bold`}>{search.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={TEXT.secondary}>No search data yet</p>
          )}
        </div>

        {/* Top Comparisons */}
        <div className={`border ${BORDERS.medium} ${RADIUS.control} p-6 bg-white dark:bg-black`}>
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: FONTS.mono }}>
            Top Comparisons
          </h2>
          {data.topComparisons.length > 0 ? (
            <div className="space-y-2">
              {data.topComparisons.map((comp, i) => (
                <div key={i} className="py-2 border-b border-border last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className={`${TEXT.body} font-semibold truncate`}>{comp.workTitle}</div>
                      <div className={`${TEXT.secondary} text-sm`}>vs {comp.screenWorkTitle}</div>
                    </div>
                    <span className={`${TEXT.secondary} font-bold ml-2`}>{comp.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={TEXT.secondary}>No comparison data yet</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`border ${BORDERS.medium} ${RADIUS.control} p-6 bg-white dark:bg-black mt-6`}>
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: FONTS.mono }}>
          Recent Activity
        </h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data.recentEvents.map((event, i) => (
            <div key={i} className="py-2 border-b border-border last:border-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className={`${TEXT.body} font-mono font-semibold`}>{event.event}</span>
                  <div className={`${TEXT.secondary} text-sm mt-1`}>
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={fetchAnalytics}
          className={`px-6 py-3 border ${BORDERS.medium} ${RADIUS.control} bg-black dark:bg-white text-white dark:text-black font-bold hover:bg-white hover:dark:bg-black hover:text-black hover:dark:text-white transition-all`}
          style={{ fontFamily: FONTS.mono }}
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}

function MetricCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={`border ${BORDERS.medium} ${RADIUS.control} p-4 ${
        highlight ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-black'
      }`}
    >
      <div
        className={`text-3xl font-black mb-1 ${highlight ? 'text-white dark:text-black' : 'text-black dark:text-white'}`}
        style={{ fontFamily: FONTS.mono }}
      >
        {value.toLocaleString()}
      </div>
      <div
        className={`text-xs uppercase tracking-wider ${
          highlight ? 'text-white/70 dark:text-black/70' : TEXT.secondary
        }`}
        style={{ fontFamily: FONTS.mono }}
      >
        {label}
      </div>
    </div>
  );
}
