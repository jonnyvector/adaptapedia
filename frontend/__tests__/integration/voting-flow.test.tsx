/**
 * Integration test: Voting flow
 * Tests the complete user flow for voting on diff items
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import DiffItemCard from '@/components/diff/DiffItemCard'
import { mockDiffItem } from '@/__tests__/utils/test-utils'
import type { Comment } from '@/lib/types'

// Mock dependencies
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const mockAuthContext = {
  isAuthenticated: true,
  user: { id: 1, username: 'testuser', email: 'test@test.com', role: 'USER' as const, reputation_points: 0, spoiler_preference: 'NONE' as const, date_joined: '2024-01-01' },
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  isLoading: false,
}

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => mockAuthContext,
}))

const mockApiVote = jest.fn()
const mockApiCommentsList = jest.fn()

jest.mock('@/lib/api', () => ({
  api: {
    diffs: {
      vote: mockApiVote,
    },
    comments: {
      list: mockApiCommentsList,
    },
  },
}))

// Don't mock useVoting - we want to test the real implementation
jest.unmock('@/hooks/useVoting')

describe('Integration: Voting Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthContext.isAuthenticated = true
    mockApiCommentsList.mockResolvedValue({
      results: [] as Comment[],
      count: 0,
      next: null,
      previous: null,
    })
  })

  it('completes full voting flow: view diff, vote, see updated count', async () => {
    const user = userEvent.setup()
    mockApiVote.mockResolvedValue({})

    const diff = mockDiffItem({
      vote_counts: { accurate: 10, needs_nuance: 2, disagree: 1 },
    })

    render(<DiffItemCard diff={diff} />)

    // Step 1: User views diff card
    await waitFor(() => {
      expect(screen.getByText(diff.claim)).toBeInTheDocument()
    })

    // Step 2: User sees current vote counts
    expect(screen.getByText('10')).toBeInTheDocument() // accurate
    expect(screen.getByText('2')).toBeInTheDocument()  // needs_nuance
    expect(screen.getByText('1')).toBeInTheDocument()  // disagree

    // Step 3: User clicks accurate vote button
    const accurateButton = screen.getByRole('button', { name: /vote accurate/i })
    await user.click(accurateButton)

    // Step 4: Vote count updates optimistically
    await waitFor(() => {
      const voteCountElements = screen.getAllByText('11')
      expect(voteCountElements.length).toBeGreaterThan(0)
    })

    // Step 5: User vote is highlighted
    expect(accurateButton).toHaveClass('bg-green-100', 'border-green-500')

    // Step 6: API was called
    expect(mockApiVote).toHaveBeenCalledWith(diff.id, 'ACCURATE')
  })

  it('allows user to change their vote', async () => {
    const user = userEvent.setup()
    mockApiVote.mockResolvedValue({})

    const diff = mockDiffItem({
      vote_counts: { accurate: 10, needs_nuance: 2, disagree: 1 },
    })

    render(<DiffItemCard diff={diff} />)

    // First vote: Accurate
    const accurateButton = screen.getByRole('button', { name: /vote accurate/i })
    await user.click(accurateButton)

    await waitFor(() => {
      expect(accurateButton).toHaveClass('bg-green-100')
    })

    // Change vote to Disagree
    const disagreeButton = screen.getByRole('button', { name: /vote disagree/i })
    await user.click(disagreeButton)

    await waitFor(() => {
      // Disagree should now be highlighted
      expect(disagreeButton).toHaveClass('bg-red-100', 'border-red-500')
      // Accurate should no longer be highlighted
      expect(accurateButton).not.toHaveClass('bg-green-100')
    })

    // Vote counts should be updated
    // accurate: 10 (back to original after removing vote)
    // disagree: 2 (1 + new vote)
    const accurateCounts = screen.getAllByText('10')
    const disagreeCounts = screen.getAllByText('2')
    expect(accurateCounts.length).toBeGreaterThan(0)
    expect(disagreeCounts.length).toBeGreaterThan(0)

    // API should have been called twice
    expect(mockApiVote).toHaveBeenCalledTimes(2)
  })

  it('handles voting when user clicks same vote button (no change)', async () => {
    const user = userEvent.setup()
    mockApiVote.mockResolvedValue({})

    const diff = mockDiffItem({
      vote_counts: { accurate: 10, needs_nuance: 2, disagree: 1 },
    })

    render(<DiffItemCard diff={diff} />)

    // First vote
    const accurateButton = screen.getByRole('button', { name: /vote accurate/i })
    await user.click(accurateButton)

    await waitFor(() => {
      expect(mockApiVote).toHaveBeenCalledTimes(1)
    })

    // Click same button again
    await user.click(accurateButton)

    // API should not be called again (same vote)
    expect(mockApiVote).toHaveBeenCalledTimes(1)

    // Vote count should remain the same
    const voteCountElements = screen.getAllByText('11')
    expect(voteCountElements.length).toBeGreaterThan(0)
  })

  it('handles vote error and shows error message', async () => {
    const user = userEvent.setup()
    mockApiVote.mockRejectedValue(new Error('Failed to submit vote'))

    const diff = mockDiffItem({
      vote_counts: { accurate: 10, needs_nuance: 2, disagree: 1 },
    })

    render(<DiffItemCard diff={diff} />)

    // Try to vote
    const accurateButton = screen.getByRole('button', { name: /vote accurate/i })
    await user.click(accurateButton)

    // Error message should appear
    await waitFor(() => {
      expect(screen.getByText(/failed to submit vote/i)).toBeInTheDocument()
    })

    // Vote counts should be rolled back to original
    expect(screen.getByText('10')).toBeInTheDocument() // accurate back to 10
  })

  it('redirects unauthenticated user to login', async () => {
    const user = userEvent.setup()
    mockAuthContext.isAuthenticated = false

    const diff = mockDiffItem()

    render(<DiffItemCard diff={diff} />)

    const accurateButton = screen.getByRole('button', { name: /vote accurate/i })
    await user.click(accurateButton)

    // Should redirect to login
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/auth/login'))
    // Should not call API
    expect(mockApiVote).not.toHaveBeenCalled()
  })
})
