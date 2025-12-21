/**
 * Integration test: Spoiler filtering flow
 * Tests how spoiler scope toggle affects visible diffs and comments
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import SpoilerScopeToggle from '@/components/diff/SpoilerScopeToggle'
import CommentsList from '@/components/diff/CommentsList'
import { mockComment } from '@/__tests__/utils/test-utils'
import type { SpoilerScope, Comment } from '@/lib/types'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
  }),
}))

jest.mock('@/lib/api', () => ({
  api: {
    comments: {
      list: jest.fn(),
    },
  },
}))

import { api } from '@/lib/api'
const mockApiCommentsList = api.comments.list as jest.MockedFunction<typeof api.comments.list>

describe('Integration: Spoiler Filtering Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('filters comments when user changes spoiler scope from NONE to FULL', async () => {
    const user = userEvent.setup()

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

    // Component that uses both SpoilerScopeToggle and CommentsList
    const TestComponent = () => {
      const [scope, setScope] = React.useState<SpoilerScope>('NONE')

      return (
        <div>
          <SpoilerScopeToggle currentScope={scope} onScopeChange={setScope} />
          <CommentsList diffItemId={1} userSpoilerScope={scope} />
        </div>
      )
    }

    render(<TestComponent />)

    // Step 1: User is at NONE scope - only safe comments visible
    await waitFor(() => {
      expect(screen.getByText('Safe comment')).toBeInTheDocument()
    })
    expect(screen.queryByText('Book spoiler')).not.toBeInTheDocument()
    expect(screen.queryByText('Screen spoiler')).not.toBeInTheDocument()
    expect(screen.queryByText('Full spoiler')).not.toBeInTheDocument()

    // Step 2: User changes to FULL scope
    const fullSpoilersButton = screen.getByRole('button', { name: /full spoilers/i })
    await user.click(fullSpoilersButton)

    // Step 3: All comments become visible
    await waitFor(() => {
      expect(screen.getByText('Safe comment')).toBeInTheDocument()
      expect(screen.getByText('Book spoiler')).toBeInTheDocument()
      expect(screen.getByText('Screen spoiler')).toBeInTheDocument()
      expect(screen.getByText('Full spoiler')).toBeInTheDocument()
    })

    // Step 4: Full Spoilers button is now highlighted
    expect(fullSpoilersButton).toHaveClass('bg-link', 'text-white')
  })

  it('shows correct description when toggling between scopes', async () => {
    const user = userEvent.setup()

    const TestComponent = () => {
      const [scope, setScope] = React.useState<SpoilerScope>('NONE')

      return <SpoilerScopeToggle currentScope={scope} onScopeChange={setScope} />
    }

    render(<TestComponent />)

    // Initial description for NONE
    expect(screen.getByText('No spoilers - high-level changes only')).toBeInTheDocument()

    // Change to BOOK_ONLY
    await user.click(screen.getByRole('button', { name: /book spoilers/i }))
    expect(screen.getByText('Show book plot details')).toBeInTheDocument()

    // Change to SCREEN_ONLY
    await user.click(screen.getByRole('button', { name: /screen spoilers/i }))
    expect(screen.getByText('Show movie/TV plot details')).toBeInTheDocument()

    // Change to FULL
    await user.click(screen.getByRole('button', { name: /full spoilers/i }))
    expect(screen.getByText('Show everything including endings')).toBeInTheDocument()
  })

  it('filters BOOK_ONLY comments correctly - does not show SCREEN_ONLY', async () => {
    const user = userEvent.setup()

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

    const TestComponent = () => {
      const [scope, setScope] = React.useState<SpoilerScope>('BOOK_ONLY')

      return (
        <div>
          <SpoilerScopeToggle currentScope={scope} onScopeChange={setScope} />
          <CommentsList diffItemId={1} userSpoilerScope={scope} />
        </div>
      )
    }

    render(<TestComponent />)

    // BOOK_ONLY scope should show NONE and BOOK_ONLY, but not SCREEN_ONLY or FULL
    await waitFor(() => {
      expect(screen.getByText('Safe comment')).toBeInTheDocument()
      expect(screen.getByText('Book spoiler')).toBeInTheDocument()
    })
    expect(screen.queryByText('Screen spoiler')).not.toBeInTheDocument()
    expect(screen.queryByText('Full spoiler')).not.toBeInTheDocument()
  })

  it('filters SCREEN_ONLY comments correctly - does not show BOOK_ONLY', async () => {
    const user = userEvent.setup()

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

    const TestComponent = () => {
      const [scope, setScope] = React.useState<SpoilerScope>('SCREEN_ONLY')

      return (
        <div>
          <SpoilerScopeToggle currentScope={scope} onScopeChange={setScope} />
          <CommentsList diffItemId={1} userSpoilerScope={scope} />
        </div>
      )
    }

    render(<TestComponent />)

    // SCREEN_ONLY scope should show NONE and SCREEN_ONLY, but not BOOK_ONLY or FULL
    await waitFor(() => {
      expect(screen.getByText('Safe comment')).toBeInTheDocument()
      expect(screen.getByText('Screen spoiler')).toBeInTheDocument()
    })
    expect(screen.queryByText('Book spoiler')).not.toBeInTheDocument()
    expect(screen.queryByText('Full spoiler')).not.toBeInTheDocument()
  })

  it('toggles between different spoiler levels seamlessly', async () => {
    const user = userEvent.setup()

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

    const TestComponent = () => {
      const [scope, setScope] = React.useState<SpoilerScope>('NONE')

      return (
        <div>
          <SpoilerScopeToggle currentScope={scope} onScopeChange={setScope} />
          <CommentsList diffItemId={1} userSpoilerScope={scope} />
        </div>
      )
    }

    render(<TestComponent />)

    // Start at NONE - only safe
    await waitFor(() => {
      expect(screen.getByText('Safe comment')).toBeInTheDocument()
    })
    expect(screen.queryByText('Book spoiler')).not.toBeInTheDocument()

    // Go to BOOK_ONLY
    await user.click(screen.getByRole('button', { name: /book spoilers/i }))
    await waitFor(() => {
      expect(screen.getByText('Book spoiler')).toBeInTheDocument()
    })
    expect(screen.queryByText('Screen spoiler')).not.toBeInTheDocument()

    // Go to FULL
    await user.click(screen.getByRole('button', { name: /full spoilers/i }))
    await waitFor(() => {
      expect(screen.getByText('Full spoiler')).toBeInTheDocument()
      expect(screen.getByText('Screen spoiler')).toBeInTheDocument()
    })

    // Go back to NONE
    await user.click(screen.getByRole('button', { name: /^safe$/i }))
    await waitFor(() => {
      expect(screen.queryByText('Book spoiler')).not.toBeInTheDocument()
      expect(screen.queryByText('Screen spoiler')).not.toBeInTheDocument()
      expect(screen.queryByText('Full spoiler')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Safe comment')).toBeInTheDocument()
  })
})
