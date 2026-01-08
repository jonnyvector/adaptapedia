import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import DiffItemCard from './DiffItemCard'
import { mockDiffItem } from '@/__tests__/utils/test-utils'
import type { Comment } from '@/lib/types'

// Mock dependencies
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

jest.mock('@/lib/auth-context', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/hooks/useVoting', () => ({
  useVoting: jest.fn(),
}))

jest.mock('@/lib/api', () => ({
  api: {
    comments: {
      list: jest.fn(),
    },
  },
}))

import { useAuth } from '@/lib/auth-context'
import { useVoting } from '@/hooks/useVoting'
import { api } from '@/lib/api'

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseVoting = useVoting as jest.MockedFunction<typeof useVoting>
const mockApiComments = api.comments.list as jest.MockedFunction<typeof api.comments.list>

describe('DiffItemCard', () => {
  const mockSubmitVote = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Default mocks
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
      isLoading: false,
    })

    mockUseVoting.mockReturnValue({
      voteCounts: { accurate: 10, needs_nuance: 2, disagree: 1 },
      userVote: null,
      isVoting: false,
      error: null,
      submitVote: mockSubmitVote,
    })

    mockApiComments.mockResolvedValue({
      results: [] as Comment[],
      count: 0,
      next: null,
      previous: null,
    })
  })

  describe('Rendering', () => {
    it('renders diff claim and details', () => {
      const diff = mockDiffItem({
        claim: 'Test difference claim',
        detail: 'Test difference detail',
      })

      render(<DiffItemCard diff={diff} />)

      expect(screen.getByText('Test difference claim')).toBeInTheDocument()
      expect(screen.getByText('Test difference detail')).toBeInTheDocument()
    })

    it('renders without detail if not provided', () => {
      const diff = mockDiffItem({
        claim: 'Test claim',
        detail: '',
      })

      render(<DiffItemCard diff={diff} />)

      expect(screen.getByText('Test claim')).toBeInTheDocument()
    })

    it('shows correct spoiler badge color for NONE', () => {
      const diff = mockDiffItem({ spoiler_scope: 'NONE' })
      render(<DiffItemCard diff={diff} />)

      const badge = screen.getByText('Safe')
      expect(badge).toHaveClass('bg-success/10', 'text-success')
    })

    it('shows correct spoiler badge color for BOOK_ONLY', () => {
      const diff = mockDiffItem({ spoiler_scope: 'BOOK_ONLY' })
      render(<DiffItemCard diff={diff} />)

      const badge = screen.getByText('Book Spoilers')
      expect(badge).toHaveClass('bg-cyan/10', 'text-cyan')
    })

    it('shows correct spoiler badge color for SCREEN_ONLY', () => {
      const diff = mockDiffItem({ spoiler_scope: 'SCREEN_ONLY' })
      render(<DiffItemCard diff={diff} />)

      const badge = screen.getByText('Screen Spoilers')
      expect(badge).toHaveClass('bg-purple/10', 'text-purple')
    })

    it('shows correct spoiler badge color for FULL', () => {
      const diff = mockDiffItem({ spoiler_scope: 'FULL' })
      render(<DiffItemCard diff={diff} />)

      const badge = screen.getByText('Full Spoilers')
      expect(badge).toHaveClass('bg-magenta/10', 'text-magenta')
    })

    it('renders vote counts correctly', () => {
      const diff = mockDiffItem()
      render(<DiffItemCard diff={diff} />)

      expect(screen.getByText('10')).toBeInTheDocument() // accurate votes
      expect(screen.getByText('2')).toBeInTheDocument()  // needs_nuance votes
      expect(screen.getByText('1')).toBeInTheDocument()  // disagree votes
    })

    it('shows total vote count', () => {
      const diff = mockDiffItem()
      render(<DiffItemCard diff={diff} />)

      expect(screen.getByText('13 votes')).toBeInTheDocument()
    })

    it('shows author username with link', () => {
      const diff = mockDiffItem({ created_by_username: 'authoruser' })
      render(<DiffItemCard diff={diff} />)

      const link = screen.getByRole('link', { name: /authoruser/i })
      expect(link).toHaveAttribute('href', '/u/authoruser')
    })
  })

  describe('Voting functionality', () => {
    it('calls submitVote when authenticated user clicks vote button', async () => {
      const user = userEvent.setup()
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: 1, username: 'testuser', email: 'test@test.com', role: 'USER', reputation_points: 0, spoiler_preference: 'NONE', date_joined: '2024-01-01' },
        login: jest.fn(),
        signup: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        isLoading: false,
      })

      const diff = mockDiffItem()
      render(<DiffItemCard diff={diff} />)

      const accurateButton = screen.getByRole('button', { name: /vote accurate/i })
      await user.click(accurateButton)

      expect(mockSubmitVote).toHaveBeenCalledWith('ACCURATE')
    })

    it('redirects to login when unauthenticated user tries to vote', async () => {
      const user = userEvent.setup()
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: jest.fn(),
        signup: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        isLoading: false,
      })

      const diff = mockDiffItem()
      render(<DiffItemCard diff={diff} />)

      const accurateButton = screen.getByRole('button', { name: /vote accurate/i })
      await user.click(accurateButton)

      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/auth/login'))
      expect(mockSubmitVote).not.toHaveBeenCalled()
    })

    it('highlights user vote when present', () => {
      mockUseVoting.mockReturnValue({
        voteCounts: { accurate: 10, needs_nuance: 2, disagree: 1 },
        userVote: 'ACCURATE',
        isVoting: false,
        error: null,
        submitVote: mockSubmitVote,
      })

      const diff = mockDiffItem()
      render(<DiffItemCard diff={diff} />)

      const accurateButton = screen.getByRole('button', { name: /vote accurate/i })
      expect(accurateButton).toHaveClass('bg-success/10', 'border-success')
    })

    it('disables vote buttons while voting', () => {
      mockUseVoting.mockReturnValue({
        voteCounts: { accurate: 10, needs_nuance: 2, disagree: 1 },
        userVote: null,
        isVoting: true,
        error: null,
        submitVote: mockSubmitVote,
      })

      const diff = mockDiffItem()
      render(<DiffItemCard diff={diff} />)

      const buttons = screen.getAllByRole('button')
      const voteButtons = buttons.filter(btn =>
        btn.getAttribute('aria-label')?.includes('Vote')
      )

      voteButtons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })

    it('shows error message when vote fails', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: 1, username: 'testuser', email: 'test@test.com', role: 'USER', reputation_points: 0, spoiler_preference: 'NONE', date_joined: '2024-01-01' },
        login: jest.fn(),
        signup: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        isLoading: false,
      })

      // Render with error state from useVoting
      mockUseVoting.mockReturnValue({
        voteCounts: { accurate: 10, needs_nuance: 2, disagree: 1 },
        userVote: null,
        isVoting: false,
        error: 'Failed to submit vote',
        submitVote: mockSubmitVote,
      })

      render(<DiffItemCard diff={mockDiffItem()} />)

      // Error should be displayed due to useEffect watching error prop
      expect(screen.getByText('Failed to submit vote')).toBeInTheDocument()
    })
  })

  describe('Comments section', () => {
    it('fetches and displays comment count', async () => {
      const mockComments = [
        { id: 1, body: 'Comment 1', diff_item: 1, user: 1, username: 'user1', spoiler_scope: 'NONE', status: 'LIVE', created_at: '2024-01-01' },
        { id: 2, body: 'Comment 2', diff_item: 1, user: 2, username: 'user2', spoiler_scope: 'NONE', status: 'LIVE', created_at: '2024-01-01' },
      ] as Comment[]

      mockApiComments.mockResolvedValue({
        results: mockComments,
        count: 2,
        next: null,
        previous: null,
      })

      const diff = mockDiffItem()
      render(<DiffItemCard diff={diff} />)

      await waitFor(() => {
        expect(screen.getByText('2 comments')).toBeInTheDocument()
      })
    })

    it('shows "No comments yet" when there are no comments', async () => {
      mockApiComments.mockResolvedValue({
        results: [],
        count: 0,
        next: null,
        previous: null,
      })

      const diff = mockDiffItem()
      render(<DiffItemCard diff={diff} />)

      await waitFor(() => {
        expect(screen.getByText('No comments yet - be the first to comment')).toBeInTheDocument()
      })
    })

    it('expands and collapses comments when clicked', async () => {
      const user = userEvent.setup()
      mockApiComments.mockResolvedValue({
        results: [],
        count: 0,
        next: null,
        previous: null,
      })

      const diff = mockDiffItem()
      render(<DiffItemCard diff={diff} />)

      await waitFor(() => {
        expect(screen.getByText('No comments yet - be the first to comment')).toBeInTheDocument()
      })

      const toggleButton = screen.getByText('No comments yet - be the first to comment')

      // Comments should not be expanded initially
      expect(screen.queryByText('+ Add a comment')).not.toBeInTheDocument()

      // Click to expand
      await user.click(toggleButton)

      await waitFor(() => {
        expect(screen.getByText('+ Add a comment')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels on vote buttons', () => {
      const diff = mockDiffItem()
      render(<DiffItemCard diff={diff} />)

      expect(screen.getByRole('button', { name: /vote accurate/i })).toHaveAttribute('aria-label', 'Vote accurate')
      expect(screen.getByRole('button', { name: /vote needs nuance/i })).toHaveAttribute('aria-label', 'Vote needs nuance')
      expect(screen.getByRole('button', { name: /vote disagree/i })).toHaveAttribute('aria-label', 'Vote disagree')
    })

    it('has descriptive title attributes on vote buttons', () => {
      const diff = mockDiffItem()
      render(<DiffItemCard diff={diff} />)

      expect(screen.getByRole('button', { name: /vote accurate/i })).toHaveAttribute('title', 'This diff is accurate - well-stated and correct')
      expect(screen.getByRole('button', { name: /vote needs nuance/i })).toHaveAttribute('title', 'Mostly correct but needs more context or clarification')
      expect(screen.getByRole('button', { name: /vote disagree/i })).toHaveAttribute('title', 'This diff is inaccurate or misleading')
    })
  })
})
