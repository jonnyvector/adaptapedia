/**
 * Tests for TrendingComparisons component.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrendingComparisons from '@/components/shared/TrendingComparisons';
import { api } from '@/lib/api';
import type { TrendingComparison } from '@/lib/types';

// Mock the API
jest.mock('@/lib/api', () => ({
  api: {
    diffs: {
      getTrending: jest.fn(),
    },
  },
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

const mockTrendingData: TrendingComparison[] = [
  {
    work_id: 1,
    work_title: 'The Hobbit',
    work_slug: 'the-hobbit',
    screen_work_id: 1,
    screen_work_title: 'The Hobbit: An Unexpected Journey',
    screen_work_slug: 'the-hobbit-unexpected-journey',
    screen_work_type: 'Movie',
    screen_work_year: 2012,
    total_diffs: 15,
    recent_diffs: 3,
    recent_votes: 8,
    activity_score: 17.0,
  },
  {
    work_id: 2,
    work_title: 'Jurassic Park',
    work_slug: 'jurassic-park',
    screen_work_id: 2,
    screen_work_title: 'Jurassic Park',
    screen_work_slug: 'jurassic-park-1993',
    screen_work_type: 'Movie',
    screen_work_year: 1993,
    total_diffs: 12,
    recent_diffs: 2,
    recent_votes: 5,
    activity_score: 11.0,
  },
  {
    work_id: 3,
    work_title: 'The Lord of the Rings',
    work_slug: 'lotr',
    screen_work_id: 3,
    screen_work_title: 'The Lord of the Rings: The Fellowship of the Ring',
    screen_work_slug: 'lotr-fellowship',
    screen_work_type: 'Movie',
    screen_work_year: 2001,
    total_diffs: 20,
    recent_diffs: 1,
    recent_votes: 3,
    activity_score: 6.0,
  },
];

describe('TrendingComparisons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (api.diffs.getTrending as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves

    render(<TrendingComparisons />);

    // Should show loading skeletons
    const loadingCards = screen.getAllByRole('generic').filter(el =>
      el.className.includes('animate-pulse')
    );
    expect(loadingCards.length).toBeGreaterThan(0);
  });

  it('renders trending comparisons successfully', async () => {
    (api.diffs.getTrending as jest.Mock).mockResolvedValue(mockTrendingData);

    render(<TrendingComparisons />);

    await waitFor(() => {
      expect(screen.getByText('The Hobbit')).toBeInTheDocument();
    });

    // Verify all comparisons are rendered
    expect(screen.getByText('The Hobbit')).toBeInTheDocument();
    expect(screen.getByText('vs. The Hobbit: An Unexpected Journey')).toBeInTheDocument();
    expect(screen.getByText('Jurassic Park')).toBeInTheDocument();
    expect(screen.getByText('vs. Jurassic Park')).toBeInTheDocument();
    expect(screen.getByText('The Lord of the Rings')).toBeInTheDocument();
    expect(screen.getByText('vs. The Lord of the Rings: The Fellowship of the Ring')).toBeInTheDocument();
  });

  it('displays trending badge on all cards', async () => {
    (api.diffs.getTrending as jest.Mock).mockResolvedValue(mockTrendingData);

    render(<TrendingComparisons />);

    await waitFor(() => {
      const trendingBadges = screen.getAllByText('Trending');
      expect(trendingBadges).toHaveLength(3);
    });
  });

  it('displays screen work type and year', async () => {
    (api.diffs.getTrending as jest.Mock).mockResolvedValue(mockTrendingData);

    render(<TrendingComparisons />);

    await waitFor(() => {
      expect(screen.getByText('Movie · 2012')).toBeInTheDocument();
      expect(screen.getByText('Movie · 1993')).toBeInTheDocument();
      expect(screen.getByText('Movie · 2001')).toBeInTheDocument();
    });
  });

  it('displays activity text correctly for multiple diffs and votes', async () => {
    (api.diffs.getTrending as jest.Mock).mockResolvedValue(mockTrendingData);

    render(<TrendingComparisons />);

    await waitFor(() => {
      expect(screen.getByText('3 new diffs · 8 votes this week')).toBeInTheDocument();
      expect(screen.getByText('2 new diffs · 5 votes this week')).toBeInTheDocument();
    });
  });

  it('displays activity text correctly for single diff', async () => {
    const singleDiffData: TrendingComparison[] = [
      {
        ...mockTrendingData[0],
        recent_diffs: 1,
        recent_votes: 0,
      },
    ];

    (api.diffs.getTrending as jest.Mock).mockResolvedValue(singleDiffData);

    render(<TrendingComparisons />);

    await waitFor(() => {
      expect(screen.getByText('1 new diff this week')).toBeInTheDocument();
    });
  });

  it('displays activity text correctly for only votes', async () => {
    const onlyVotesData: TrendingComparison[] = [
      {
        ...mockTrendingData[0],
        recent_diffs: 0,
        recent_votes: 5,
      },
    ];

    (api.diffs.getTrending as jest.Mock).mockResolvedValue(onlyVotesData);

    render(<TrendingComparisons />);

    await waitFor(() => {
      expect(screen.getByText('5 votes this week')).toBeInTheDocument();
    });
  });

  it('displays total diff count', async () => {
    (api.diffs.getTrending as jest.Mock).mockResolvedValue(mockTrendingData);

    render(<TrendingComparisons />);

    await waitFor(() => {
      expect(screen.getByText('15 diffs')).toBeInTheDocument();
      expect(screen.getByText('12 diffs')).toBeInTheDocument();
      expect(screen.getByText('20 diffs')).toBeInTheDocument();
    });
  });

  it('displays singular "diff" for single total diff', async () => {
    const singleTotalDiffData: TrendingComparison[] = [
      {
        ...mockTrendingData[0],
        total_diffs: 1,
      },
    ];

    (api.diffs.getTrending as jest.Mock).mockResolvedValue(singleTotalDiffData);

    render(<TrendingComparisons />);

    await waitFor(() => {
      expect(screen.getByText('1 diff')).toBeInTheDocument();
    });
  });

  it('renders correct links to comparison pages', async () => {
    (api.diffs.getTrending as jest.Mock).mockResolvedValue(mockTrendingData);

    render(<TrendingComparisons />);

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/compare/the-hobbit/the-hobbit-unexpected-journey');
      expect(links[1]).toHaveAttribute('href', '/compare/jurassic-park/jurassic-park-1993');
      expect(links[2]).toHaveAttribute('href', '/compare/lotr/lotr-fellowship');
    });
  });

  it('handles empty trending data', async () => {
    (api.diffs.getTrending as jest.Mock).mockResolvedValue([]);

    render(<TrendingComparisons />);

    await waitFor(() => {
      expect(screen.getByText('No trending comparisons available yet')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    (api.diffs.getTrending as jest.Mock).mockRejectedValue(new Error('API Error'));

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<TrendingComparisons />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load trending comparisons')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('respects custom limit prop', async () => {
    (api.diffs.getTrending as jest.Mock).mockResolvedValue(mockTrendingData);

    render(<TrendingComparisons limit={3} />);

    await waitFor(() => {
      expect(api.diffs.getTrending).toHaveBeenCalledWith(3);
    });
  });

  it('uses default limit of 6 when not specified', async () => {
    (api.diffs.getTrending as jest.Mock).mockResolvedValue(mockTrendingData);

    render(<TrendingComparisons />);

    await waitFor(() => {
      expect(api.diffs.getTrending).toHaveBeenCalledWith(6);
    });
  });

  it('applies hover styles to cards', async () => {
    (api.diffs.getTrending as jest.Mock).mockResolvedValue(mockTrendingData);

    render(<TrendingComparisons />);

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links[0].className).toContain('hover:shadow-lg');
      expect(links[0].className).toContain('hover:border-link/30');
    });
  });

  it('handles null screen work year', async () => {
    const dataWithNullYear: TrendingComparison[] = [
      {
        ...mockTrendingData[0],
        screen_work_year: null,
      },
    ];

    (api.diffs.getTrending as jest.Mock).mockResolvedValue(dataWithNullYear);

    render(<TrendingComparisons />);

    await waitFor(() => {
      // Should only show type, not year
      expect(screen.getByText('Movie')).toBeInTheDocument();
      expect(screen.queryByText('Movie · null')).not.toBeInTheDocument();
    });
  });

  it('renders in grid layout', async () => {
    (api.diffs.getTrending as jest.Mock).mockResolvedValue(mockTrendingData);

    const { container } = render(<TrendingComparisons />);

    await waitFor(() => {
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer?.className).toContain('md:grid-cols-2');
      expect(gridContainer?.className).toContain('lg:grid-cols-3');
    });
  });

  it('is mobile responsive', async () => {
    (api.diffs.getTrending as jest.Mock).mockResolvedValue(mockTrendingData);

    const { container } = render(<TrendingComparisons />);

    await waitFor(() => {
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer?.className).toContain('grid-cols-1');
    });
  });
});
