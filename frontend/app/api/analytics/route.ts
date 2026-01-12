import { NextResponse } from 'next/server';

export async function GET() {
  const posthogProjectId = process.env.NEXT_PUBLIC_POSTHOG_KEY?.split('_')[1]; // Extract project ID from key
  const posthogApiKey = process.env.POSTHOG_API_KEY; // Personal API key (different from public key)

  if (!posthogProjectId || !posthogApiKey) {
    return NextResponse.json({ error: 'PostHog not configured' }, { status: 500 });
  }

  try {
    // Fetch events from last 7 days
    const response = await fetch(
      `https://us.i.posthog.com/api/projects/${posthogProjectId}/events/?limit=1000`,
      {
        headers: {
          'Authorization': `Bearer ${posthogApiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch PostHog data');
    }

    const data = await response.json();

    // Process and aggregate the data
    const events = data.results || [];

    const metrics = {
      totalEvents: events.length,
      pageviews: events.filter((e: any) => e.event === '$pageview').length,
      signups: events.filter((e: any) => e.event === 'user_signed_up').length,
      logins: events.filter((e: any) => e.event === 'user_logged_in').length,
      searches: events.filter((e: any) => e.event === 'search_performed').length,
      diffVotes: events.filter((e: any) => e.event === 'diff_voted').length,
      comparisonViews: events.filter((e: any) => e.event === 'comparison_viewed').length,
      randomClicks: events.filter((e: any) => e.event === 'random_comparison_clicked').length,
      onboardingCompleted: events.filter((e: any) => e.event === 'onboarding_completed').length,

      // Top searches
      topSearches: getTopSearches(events),

      // Top comparisons viewed
      topComparisons: getTopComparisons(events),

      // Recent activity
      recentEvents: events.slice(0, 20).map((e: any) => ({
        event: e.event,
        timestamp: e.timestamp,
        properties: e.properties,
      })),
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

function getTopSearches(events: any[]) {
  const searches = events.filter(e => e.event === 'search_performed');
  const queryCount: Record<string, number> = {};

  searches.forEach(e => {
    const query = e.properties?.query;
    if (query) {
      queryCount[query] = (queryCount[query] || 0) + 1;
    }
  });

  return Object.entries(queryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));
}

function getTopComparisons(events: any[]) {
  const comparisons = events.filter(e => e.event === 'comparison_viewed');
  const comparisonCount: Record<string, any> = {};

  comparisons.forEach(e => {
    const key = `${e.properties?.workTitle} vs ${e.properties?.screenWorkTitle}`;
    if (!comparisonCount[key]) {
      comparisonCount[key] = {
        workTitle: e.properties?.workTitle,
        screenWorkTitle: e.properties?.screenWorkTitle,
        count: 0,
      };
    }
    comparisonCount[key].count++;
  });

  return Object.values(comparisonCount)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 10);
}
