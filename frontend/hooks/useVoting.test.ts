import { renderHook, act, waitFor } from '@testing-library/react'
import { useVoting } from './useVoting'
import type { VoteType } from '@/lib/types'

// Mock the API
jest.mock('@/lib/api', () => ({
  api: {
    diffs: {
      vote: jest.fn(),
    },
  },
}))

import { api } from '@/lib/api'
const mockVote = api.diffs.vote as jest.MockedFunction<typeof api.diffs.vote>

describe('useVoting', () => {
  const initialVoteCounts = {
    accurate: 10,
    needs_nuance: 5,
    disagree: 2,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial state', () => {
    it('initializes with provided vote counts', () => {
      const { result } = renderHook(() => useVoting(1, initialVoteCounts))

      expect(result.current.voteCounts).toEqual(initialVoteCounts)
    })

    it('initializes with null user vote by default', () => {
      const { result } = renderHook(() => useVoting(1, initialVoteCounts))

      expect(result.current.userVote).toBeNull()
    })

    it('initializes with provided user vote', () => {
      const { result } = renderHook(() => useVoting(1, initialVoteCounts, 'ACCURATE'))

      expect(result.current.userVote).toBe('ACCURATE')
    })

    it('initializes with isVoting false', () => {
      const { result } = renderHook(() => useVoting(1, initialVoteCounts))

      expect(result.current.isVoting).toBe(false)
    })

    it('initializes with no error', () => {
      const { result } = renderHook(() => useVoting(1, initialVoteCounts))

      expect(result.current.error).toBeNull()
    })
  })

  describe('Optimistic vote updates', () => {
    it('immediately updates vote counts when voting', async () => {
      mockVote.mockResolvedValue({
        id: 1,
        diff_item: 1,
        user: 1,
        vote: 'ACCURATE',
        created_at: new Date().toISOString(),
      })

      const { result } = renderHook(() => useVoting(1, initialVoteCounts))

      await act(async () => {
        await result.current.submitVote('ACCURATE')
      })

      // Vote count should increase immediately
      expect(result.current.voteCounts.accurate).toBe(11)
      expect(result.current.userVote).toBe('ACCURATE')
    })

    it('immediately updates when changing vote', async () => {
      mockVote.mockResolvedValue({
        id: 1,
        diff_item: 1,
        user: 1,
        vote: 'ACCURATE',
        created_at: new Date().toISOString(),
      })

      const { result } = renderHook(() => useVoting(1, initialVoteCounts, 'ACCURATE'))

      await act(async () => {
        await result.current.submitVote('DISAGREE')
      })

      // Accurate should decrease, disagree should increase
      expect(result.current.voteCounts.accurate).toBe(9)
      expect(result.current.voteCounts.disagree).toBe(3)
      expect(result.current.userVote).toBe('DISAGREE')
    })

    it('handles vote toggling by removing vote when same vote is clicked', async () => {
      mockVote.mockResolvedValue({
        id: 1,
        diff_item: 1,
        user: 1,
        vote: 'ACCURATE',
        created_at: new Date().toISOString(),
      })

      const { result } = renderHook(() => useVoting(1, initialVoteCounts, 'ACCURATE'))

      await act(async () => {
        await result.current.submitVote('ACCURATE')
      })

      // Vote should be removed (toggled off)
      expect(result.current.voteCounts.accurate).toBe(9) // 10 - 1
      expect(result.current.userVote).toBeNull()
      expect(mockVote).toHaveBeenCalledWith(1, 'ACCURATE')
    })
  })

  describe('API interaction', () => {
    it('calls API with correct parameters', async () => {
      mockVote.mockResolvedValue({
        id: 1,
        diff_item: 1,
        user: 1,
        vote: 'ACCURATE',
        created_at: new Date().toISOString(),
      })

      const { result } = renderHook(() => useVoting(123, initialVoteCounts))

      await act(async () => {
        await result.current.submitVote('NEEDS_NUANCE')
      })

      expect(mockVote).toHaveBeenCalledWith(123, 'NEEDS_NUANCE')
    })

    it('sets isVoting to true during API call', async () => {
      let resolveVote: (value: any) => void
      mockVote.mockReturnValue(
        new Promise(resolve => {
          resolveVote = resolve
        })
      )

      const { result } = renderHook(() => useVoting(1, initialVoteCounts))

      let votingStateDuringCall = false

      act(() => {
        result.current.submitVote('ACCURATE').then(() => {
          // Promise resolved
        })
      })

      // Check isVoting is true during the call
      await waitFor(() => {
        votingStateDuringCall = result.current.isVoting
        expect(votingStateDuringCall).toBe(true)
      })

      // Resolve the promise
      await act(async () => {
        resolveVote!({})
      })

      // isVoting should be false after completion
      expect(result.current.isVoting).toBe(false)
    })

    it('sets isVoting to false after successful vote', async () => {
      mockVote.mockResolvedValue({
        id: 1,
        diff_item: 1,
        user: 1,
        vote: 'ACCURATE',
        created_at: new Date().toISOString(),
      })

      const { result } = renderHook(() => useVoting(1, initialVoteCounts))

      await act(async () => {
        await result.current.submitVote('ACCURATE')
      })

      expect(result.current.isVoting).toBe(false)
    })

    it('sets isVoting to false after failed vote', async () => {
      mockVote.mockRejectedValue(new Error('Vote failed'))

      const { result } = renderHook(() => useVoting(1, initialVoteCounts))

      await act(async () => {
        await result.current.submitVote('ACCURATE')
      })

      expect(result.current.isVoting).toBe(false)
    })
  })

  describe('Error handling and rollback', () => {
    it('rolls back vote counts on API error', async () => {
      mockVote.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useVoting(1, initialVoteCounts))

      await act(async () => {
        await result.current.submitVote('ACCURATE')
      })

      // Vote counts should be rolled back to original
      expect(result.current.voteCounts).toEqual(initialVoteCounts)
    })

    it('rolls back user vote on API error', async () => {
      mockVote.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useVoting(1, initialVoteCounts, 'ACCURATE'))

      await act(async () => {
        await result.current.submitVote('DISAGREE')
      })

      // User vote should be rolled back to original
      expect(result.current.userVote).toBe('ACCURATE')
    })

    it('sets error message on API failure', async () => {
      mockVote.mockRejectedValue(new Error('Vote failed'))

      const { result } = renderHook(() => useVoting(1, initialVoteCounts))

      await act(async () => {
        await result.current.submitVote('ACCURATE')
      })

      expect(result.current.error).toBe('Vote failed')
    })

    it('sets generic error message for non-Error failures', async () => {
      mockVote.mockRejectedValue('Unknown error')

      const { result } = renderHook(() => useVoting(1, initialVoteCounts))

      await act(async () => {
        await result.current.submitVote('ACCURATE')
      })

      expect(result.current.error).toBe('Failed to submit vote. Please try again.')
    })

    it('clears error on successful vote after previous error', async () => {
      mockVote.mockRejectedValueOnce(new Error('First vote failed'))
      mockVote.mockResolvedValueOnce({
        id: 1,
        diff_item: 1,
        user: 1,
        vote: 'ACCURATE',
        created_at: new Date().toISOString(),
      })

      const { result } = renderHook(() => useVoting(1, initialVoteCounts))

      // First vote fails
      await act(async () => {
        await result.current.submitVote('ACCURATE')
      })

      expect(result.current.error).toBe('First vote failed')

      // Second vote succeeds
      await act(async () => {
        await result.current.submitVote('NEEDS_NUANCE')
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('Vote count calculations', () => {
    it('correctly decrements previous vote when changing', async () => {
      mockVote.mockResolvedValue({
        id: 1,
        diff_item: 1,
        user: 1,
        vote: 'ACCURATE',
        created_at: new Date().toISOString(),
      })

      const { result } = renderHook(() => useVoting(1, initialVoteCounts, 'NEEDS_NUANCE'))

      await act(async () => {
        await result.current.submitVote('ACCURATE')
      })

      expect(result.current.voteCounts.needs_nuance).toBe(4) // 5 - 1
      expect(result.current.voteCounts.accurate).toBe(11)    // 10 + 1
    })

    it('does not allow negative vote counts', async () => {
      mockVote.mockResolvedValue({
        id: 1,
        diff_item: 1,
        user: 1,
        vote: 'ACCURATE',
        created_at: new Date().toISOString(),
      })

      const voteCounts = { accurate: 0, needs_nuance: 0, disagree: 0 }
      const { result } = renderHook(() => useVoting(1, voteCounts, 'ACCURATE'))

      await act(async () => {
        await result.current.submitVote('DISAGREE')
      })

      expect(result.current.voteCounts.accurate).toBe(0) // Should not go negative
      expect(result.current.voteCounts.disagree).toBe(1)
    })
  })

  describe('Multiple votes in sequence', () => {
    it('handles multiple sequential votes correctly', async () => {
      mockVote.mockResolvedValue({
        id: 1,
        diff_item: 1,
        user: 1,
        vote: 'ACCURATE',
        created_at: new Date().toISOString(),
      })

      const { result } = renderHook(() => useVoting(1, initialVoteCounts))

      // First vote
      await act(async () => {
        await result.current.submitVote('ACCURATE')
      })

      expect(result.current.voteCounts.accurate).toBe(11)
      expect(result.current.userVote).toBe('ACCURATE')

      // Change vote
      await act(async () => {
        await result.current.submitVote('DISAGREE')
      })

      expect(result.current.voteCounts.accurate).toBe(10)
      expect(result.current.voteCounts.disagree).toBe(3)
      expect(result.current.userVote).toBe('DISAGREE')

      // Change vote again
      await act(async () => {
        await result.current.submitVote('NEEDS_NUANCE')
      })

      expect(result.current.voteCounts.disagree).toBe(2)
      expect(result.current.voteCounts.needs_nuance).toBe(6)
      expect(result.current.userVote).toBe('NEEDS_NUANCE')
    })
  })

  describe('VoteType conversions', () => {
    it('correctly converts ACCURATE vote type', async () => {
      mockVote.mockResolvedValue({
        id: 1,
        diff_item: 1,
        user: 1,
        vote: 'ACCURATE',
        created_at: new Date().toISOString(),
      })

      const { result } = renderHook(() => useVoting(1, initialVoteCounts))

      await act(async () => {
        await result.current.submitVote('ACCURATE')
      })

      expect(result.current.voteCounts.accurate).toBe(11)
    })

    it('correctly converts NEEDS_NUANCE vote type', async () => {
      mockVote.mockResolvedValue({
        id: 1,
        diff_item: 1,
        user: 1,
        vote: 'ACCURATE',
        created_at: new Date().toISOString(),
      })

      const { result } = renderHook(() => useVoting(1, initialVoteCounts))

      await act(async () => {
        await result.current.submitVote('NEEDS_NUANCE')
      })

      expect(result.current.voteCounts.needs_nuance).toBe(6)
    })

    it('correctly converts DISAGREE vote type', async () => {
      mockVote.mockResolvedValue({
        id: 1,
        diff_item: 1,
        user: 1,
        vote: 'ACCURATE',
        created_at: new Date().toISOString(),
      })

      const { result } = renderHook(() => useVoting(1, initialVoteCounts))

      await act(async () => {
        await result.current.submitVote('DISAGREE')
      })

      expect(result.current.voteCounts.disagree).toBe(3)
    })
  })
})
