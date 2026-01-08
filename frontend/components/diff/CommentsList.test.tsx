import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import CommentsList from './CommentsList'
import { mockComment } from '@/__tests__/utils/test-utils'
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

jest.mock('@/lib/api', () => ({
  api: {
    comments: {
      list: jest.fn(),
    },
  },
}))

jest.mock('./AddCommentForm', () => {
  return function MockAddCommentForm({ onCommentAdded, onCancel }: any) {
    return (
      <div data-testid="add-comment-form">
        <button onClick={onCommentAdded}>Submit Comment</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    )
  }
})

import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockApiCommentsList = api.comments.list as jest.MockedFunction<typeof api.comments.list>

describe('CommentsList', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
      isLoading: false,
    })
  })

  describe('Loading and fetching', () => {
    it('fetches and displays comments', async () => {
      const comments: Comment[] = [
        mockComment({ id: 1, body: 'First comment', username: 'user1' }),
        mockComment({ id: 2, body: 'Second comment', username: 'user2' }),
      ]

      mockApiCommentsList.mockResolvedValue({
        results: comments,
        count: 2,
        next: null,
        previous: null,
      })

      render(<CommentsList diffItemId={1} userSpoilerScope="NONE" />)

      await waitFor(() => {
        expect(screen.getByText('First comment')).toBeInTheDocument()
        expect(screen.getByText('Second comment')).toBeInTheDocument()
      })
    })

    it('shows loading skeleton while fetching', () => {
      mockApiCommentsList.mockImplementation(() => new Promise(() => {}))

      render(<CommentsList diffItemId={1} userSpoilerScope="NONE" />)

      const loadingElement = screen.getByRole('status', { hidden: true })
      expect(loadingElement).toHaveAttribute('aria-busy', 'true')
    })

    it('shows error message when fetch fails', async () => {
      mockApiCommentsList.mockRejectedValue(new Error('Network error'))

      render(<CommentsList diffItemId={1} userSpoilerScope="NONE" />)

      await waitFor(() => {
        expect(screen.getByText('Failed to load comments')).toBeInTheDocument()
      })
    })

    it('shows empty state when there are no comments', async () => {
      mockApiCommentsList.mockResolvedValue({
        results: [],
        count: 0,
        next: null,
        previous: null,
      })

      render(<CommentsList diffItemId={1} userSpoilerScope="NONE" />)

      await waitFor(() => {
        expect(screen.getByText('No comments yet')).toBeInTheDocument()
        expect(screen.getByText('Be the first to share your thoughts!')).toBeInTheDocument()
      })
    })
  })

  describe('Spoiler filtering', () => {
    it('filters comments based on user spoiler scope (NONE)', async () => {
      const comments: Comment[] = [
        mockComment({ id: 1, body: 'Safe comment', spoiler_scope: 'NONE' }),
        mockComment({ id: 2, body: 'Book spoiler', spoiler_scope: 'BOOK_ONLY' }),
        mockComment({ id: 3, body: 'Screen spoiler', spoiler_scope: 'SCREEN_ONLY' }),
        mockComment({ id: 4, body: 'Full spoiler', spoiler_scope: 'FULL' }),
      ]

      mockApiCommentsList.mockResolvedValue({
        results: comments,
        count: 4,
        next: null,
        previous: null,
      })

      render(<CommentsList diffItemId={1} userSpoilerScope="NONE" />)

      await waitFor(() => {
        expect(screen.getByText('Safe comment')).toBeInTheDocument()
        expect(screen.queryByText('Book spoiler')).not.toBeInTheDocument()
        expect(screen.queryByText('Screen spoiler')).not.toBeInTheDocument()
        expect(screen.queryByText('Full spoiler')).not.toBeInTheDocument()
      })
    })

    it('filters comments based on user spoiler scope (BOOK_ONLY)', async () => {
      const comments: Comment[] = [
        mockComment({ id: 1, body: 'Safe comment', spoiler_scope: 'NONE' }),
        mockComment({ id: 2, body: 'Book spoiler', spoiler_scope: 'BOOK_ONLY' }),
        mockComment({ id: 3, body: 'Screen spoiler', spoiler_scope: 'SCREEN_ONLY' }),
        mockComment({ id: 4, body: 'Full spoiler', spoiler_scope: 'FULL' }),
      ]

      mockApiCommentsList.mockResolvedValue({
        results: comments,
        count: 4,
        next: null,
        previous: null,
      })

      render(<CommentsList diffItemId={1} userSpoilerScope="BOOK_ONLY" />)

      await waitFor(() => {
        expect(screen.getByText('Safe comment')).toBeInTheDocument()
        expect(screen.getByText('Book spoiler')).toBeInTheDocument()
        expect(screen.queryByText('Screen spoiler')).not.toBeInTheDocument()
        expect(screen.queryByText('Full spoiler')).not.toBeInTheDocument()
      })
    })

    it('filters comments based on user spoiler scope (FULL)', async () => {
      const comments: Comment[] = [
        mockComment({ id: 1, body: 'Safe comment', spoiler_scope: 'NONE' }),
        mockComment({ id: 2, body: 'Book spoiler', spoiler_scope: 'BOOK_ONLY' }),
        mockComment({ id: 3, body: 'Screen spoiler', spoiler_scope: 'SCREEN_ONLY' }),
        mockComment({ id: 4, body: 'Full spoiler', spoiler_scope: 'FULL' }),
      ]

      mockApiCommentsList.mockResolvedValue({
        results: comments,
        count: 4,
        next: null,
        previous: null,
      })

      render(<CommentsList diffItemId={1} userSpoilerScope="FULL" />)

      await waitFor(() => {
        expect(screen.getByText('Safe comment')).toBeInTheDocument()
        expect(screen.getByText('Book spoiler')).toBeInTheDocument()
        expect(screen.getByText('Screen spoiler')).toBeInTheDocument()
        expect(screen.getByText('Full spoiler')).toBeInTheDocument()
      })
    })
  })

  describe('Add comment functionality', () => {
    it('shows "Add a comment" button when authenticated', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: 1, username: 'testuser', email: 'test@test.com', role: 'USER', reputation_points: 0, spoiler_preference: 'NONE', date_joined: '2024-01-01' },
        login: jest.fn(),
        signup: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        isLoading: false,
      })

      mockApiCommentsList.mockResolvedValue({
        results: [],
        count: 0,
        next: null,
        previous: null,
      })

      render(<CommentsList diffItemId={1} userSpoilerScope="NONE" />)

      await waitFor(() => {
        expect(screen.getByText('+ Add a comment')).toBeInTheDocument()
      })
    })

    it('shows add comment form when button is clicked', async () => {
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

      mockApiCommentsList.mockResolvedValue({
        results: [],
        count: 0,
        next: null,
        previous: null,
      })

      render(<CommentsList diffItemId={1} userSpoilerScope="NONE" />)

      await waitFor(() => {
        expect(screen.getByText('+ Add a comment')).toBeInTheDocument()
      })

      await user.click(screen.getByText('+ Add a comment'))

      expect(screen.getByTestId('add-comment-form')).toBeInTheDocument()
    })

    it('redirects to login when unauthenticated user clicks add comment', async () => {
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

      mockApiCommentsList.mockResolvedValue({
        results: [],
        count: 0,
        next: null,
        previous: null,
      })

      render(<CommentsList diffItemId={1} userSpoilerScope="NONE" />)

      await waitFor(() => {
        expect(screen.getByText('+ Add a comment')).toBeInTheDocument()
      })

      await user.click(screen.getByText('+ Add a comment'))

      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/auth/login'))
    })

    it('refreshes comments list after comment is added', async () => {
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

      // First call returns empty array
      mockApiCommentsList.mockResolvedValueOnce({
        results: [],
        count: 0,
        next: null,
        previous: null,
      })

      render(<CommentsList diffItemId={1} userSpoilerScope="NONE" />)

      await waitFor(() => {
        expect(screen.getByText('+ Add a comment')).toBeInTheDocument()
      })

      await user.click(screen.getByText('+ Add a comment'))

      // Second call returns a comment after submission
      mockApiCommentsList.mockResolvedValueOnce({
        results: [mockComment({ id: 1, body: 'New comment' })],
        count: 1,
        next: null,
        previous: null,
      })

      await user.click(screen.getByText('Submit Comment'))

      await waitFor(() => {
        expect(mockApiCommentsList).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Comment rendering', () => {
    it('displays comment username with link', async () => {
      mockApiCommentsList.mockResolvedValue({
        results: [mockComment({ username: 'commentauthor', body: 'Test comment' })],
        count: 1,
        next: null,
        previous: null,
      })

      render(<CommentsList diffItemId={1} userSpoilerScope="NONE" />)

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /commentauthor/i })
        expect(link).toHaveAttribute('href', '/u/commentauthor')
      })
    })

    it('shows spoiler badge for non-NONE spoiler scopes', async () => {
      mockApiCommentsList.mockResolvedValue({
        results: [mockComment({ body: 'Spoiler comment', spoiler_scope: 'BOOK_ONLY' })],
        count: 1,
        next: null,
        previous: null,
      })

      render(<CommentsList diffItemId={1} userSpoilerScope="FULL" />)

      await waitFor(() => {
        expect(screen.getByText('Book Spoilers')).toBeInTheDocument()
      })
    })

    it('does not show spoiler badge for NONE scope', async () => {
      mockApiCommentsList.mockResolvedValue({
        results: [mockComment({ body: 'Safe comment', spoiler_scope: 'NONE' })],
        count: 1,
        next: null,
        previous: null,
      })

      render(<CommentsList diffItemId={1} userSpoilerScope="NONE" />)

      await waitFor(() => {
        expect(screen.getByText('Safe comment')).toBeInTheDocument()
      })

      expect(screen.queryByText('Safe')).not.toBeInTheDocument()
      expect(screen.queryByText('Book Spoilers')).not.toBeInTheDocument()
    })

    it('truncates long comments and shows expand button', async () => {
      const longBody = 'a'.repeat(400)
      mockApiCommentsList.mockResolvedValue({
        results: [mockComment({ body: longBody })],
        count: 1,
        next: null,
        previous: null,
      })

      render(<CommentsList diffItemId={1} userSpoilerScope="NONE" />)

      await waitFor(() => {
        expect(screen.getByText(/show more/i)).toBeInTheDocument()
      })
    })

    it('expands truncated comment when "Show more" is clicked', async () => {
      const user = userEvent.setup()
      const longBody = 'a'.repeat(400)
      mockApiCommentsList.mockResolvedValue({
        results: [mockComment({ body: longBody })],
        count: 1,
        next: null,
        previous: null,
      })

      render(<CommentsList diffItemId={1} userSpoilerScope="NONE" />)

      await waitFor(() => {
        expect(screen.getByText(/show more/i)).toBeInTheDocument()
      })

      const expandButton = screen.getByText(/show more/i)
      await user.click(expandButton)

      expect(screen.getByText(/show less/i)).toBeInTheDocument()
    })
  })

  describe('Comment count callback', () => {
    it('calls onCommentCountChange with correct count', async () => {
      const onCommentCountChange = jest.fn()
      mockApiCommentsList.mockResolvedValue({
        results: [
          mockComment({ id: 1 }),
          mockComment({ id: 2 }),
          mockComment({ id: 3 }),
        ],
        count: 3,
        next: null,
        previous: null,
      })

      render(
        <CommentsList
          diffItemId={1}
          userSpoilerScope="NONE"
          onCommentCountChange={onCommentCountChange}
        />
      )

      await waitFor(() => {
        expect(onCommentCountChange).toHaveBeenCalledWith(3)
      })
    })
  })
})
