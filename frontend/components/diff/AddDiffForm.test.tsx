import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import AddDiffForm from './AddDiffForm'
import { mockWork, mockScreenWork } from '@/__tests__/utils/test-utils'
import { ApiError } from '@/lib/api'

// Mock dependencies
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

jest.mock('@/lib/api', () => ({
  api: {
    diffs: {
      create: jest.fn(),
    },
  },
  ApiError: class ApiError extends Error {
    constructor(
      message: string,
      public status: number,
      public detail?: unknown
    ) {
      super(message)
      this.name = 'ApiError'
    }
  },
}))

import { api } from '@/lib/api'
const mockApiDiffsCreate = api.diffs.create as jest.MockedFunction<typeof api.diffs.create>

describe('AddDiffForm', () => {
  const work = mockWork()
  const screenWork = mockScreenWork()

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Rendering', () => {
    it('renders all form fields', () => {
      render(<AddDiffForm work={work} screenWork={screenWork} />)

      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^claim/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/detail/i)).toBeInTheDocument()
      expect(screen.getByText(/spoiler scope/i)).toBeInTheDocument()
    })

    it('shows work and screen work titles in header', () => {
      render(<AddDiffForm work={work} screenWork={screenWork} />)

      expect(screen.getByText(work.title)).toBeInTheDocument()
      expect(screen.getByText(screenWork.title)).toBeInTheDocument()
    })

    it('renders all category options', () => {
      render(<AddDiffForm work={work} screenWork={screenWork} />)

      const categorySelect = screen.getByLabelText(/category/i) as HTMLSelectElement
      const options = Array.from(categorySelect.options).map(opt => opt.value)

      expect(options).toContain('PLOT')
      expect(options).toContain('CHARACTER')
      expect(options).toContain('ENDING')
      expect(options).toContain('SETTING')
      expect(options).toContain('THEME')
      expect(options).toContain('TONE')
      expect(options).toContain('TIMELINE')
      expect(options).toContain('WORLDBUILDING')
      expect(options).toContain('OTHER')
    })

    it('renders all spoiler scope options', () => {
      render(<AddDiffForm work={work} screenWork={screenWork} />)

      expect(screen.getByLabelText(/none \(safe\/high-level\)/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/book only/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/screen only/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/full \(both\)/i)).toBeInTheDocument()
    })

    it('shows character counters for claim and detail', () => {
      render(<AddDiffForm work={work} screenWork={screenWork} />)

      expect(screen.getByText('0/200')).toBeInTheDocument() // claim counter
      expect(screen.getByText('0/1000')).toBeInTheDocument() // detail counter
    })

    it('renders action buttons', () => {
      render(<AddDiffForm work={work} screenWork={screenWork} />)

      expect(screen.getByRole('button', { name: /submit difference/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })
  })

  describe('Form validation', () => {
    it('validates claim minimum length (10 characters)', async () => {
      const user = userEvent.setup()
      render(<AddDiffForm work={work} screenWork={screenWork} />)

      await user.selectOptions(screen.getByLabelText(/category/i), 'PLOT')
      await user.type(screen.getByLabelText(/^claim/i), 'Too short')
      await user.click(screen.getByRole('button', { name: /submit difference/i }))

      await waitFor(() => {
        expect(screen.getByText(/claim must be at least 10 characters/i)).toBeInTheDocument()
      })
      expect(mockApiDiffsCreate).not.toHaveBeenCalled()
    })

    it('validates claim maximum length (200 characters)', async () => {
      const user = userEvent.setup()
      render(<AddDiffForm work={work} screenWork={screenWork} />)

      const longClaim = 'a'.repeat(201)
      await user.selectOptions(screen.getByLabelText(/category/i), 'PLOT')
      await user.type(screen.getByLabelText(/^claim/i), longClaim)
      await user.click(screen.getByRole('button', { name: /submit difference/i }))

      await waitFor(() => {
        expect(screen.getByText(/claim must not exceed 200 characters/i)).toBeInTheDocument()
      })
      expect(mockApiDiffsCreate).not.toHaveBeenCalled()
    })

    it('validates detail maximum length (1000 characters)', async () => {
      const user = userEvent.setup()
      render(<AddDiffForm work={work} screenWork={screenWork} />)

      const longDetail = 'a'.repeat(1001)
      await user.selectOptions(screen.getByLabelText(/category/i), 'PLOT')
      await user.type(screen.getByLabelText(/^claim/i), 'Valid claim here')
      await user.type(screen.getByLabelText(/detail/i), longDetail)
      await user.click(screen.getByRole('button', { name: /submit difference/i }))

      await waitFor(() => {
        expect(screen.getByText(/detail must not exceed 1000 characters/i)).toBeInTheDocument()
      })
      expect(mockApiDiffsCreate).not.toHaveBeenCalled()
    })

    it('requires category selection', async () => {
      const user = userEvent.setup()
      render(<AddDiffForm work={work} screenWork={screenWork} />)

      await user.type(screen.getByLabelText(/^claim/i), 'Valid claim here')
      await user.click(screen.getByRole('button', { name: /submit difference/i }))

      await waitFor(() => {
        expect(screen.getByText(/please select a category/i)).toBeInTheDocument()
      })
      expect(mockApiDiffsCreate).not.toHaveBeenCalled()
    })

    it('updates character counter as user types', async () => {
      const user = userEvent.setup()
      render(<AddDiffForm work={work} screenWork={screenWork} />)

      const claimInput = screen.getByLabelText(/^claim/i)
      await user.type(claimInput, 'Test claim')

      expect(screen.getByText('10/200')).toBeInTheDocument()
    })

    it('shows character counter in red when exceeding limit', async () => {
      const user = userEvent.setup()
      render(<AddDiffForm work={work} screenWork={screenWork} />)

      const claimInput = screen.getByLabelText(/^claim/i)
      await user.type(claimInput, 'a'.repeat(201))

      const counter = screen.getByText('201/200')
      expect(counter).toHaveClass('text-red-500')
    })
  })

  describe('Form submission', () => {
    it('submits form with correct data', async () => {
      const user = userEvent.setup()
      mockApiDiffsCreate.mockResolvedValue({
        id: 1,
        work: work.id,
        screen_work: screenWork.id,
        category: 'PLOT',
        claim: 'Test claim here',
        detail: 'Test detail',
        spoiler_scope: 'NONE',
        status: 'LIVE',
        created_by: 1,
        created_by_username: 'testuser',
        vote_counts: { accurate: 0, needs_nuance: 0, disagree: 0 },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      })

      render(<AddDiffForm work={work} screenWork={screenWork} />)

      await user.selectOptions(screen.getByLabelText(/category/i), 'PLOT')
      await user.type(screen.getByLabelText(/^claim/i), 'Test claim here')
      await user.type(screen.getByLabelText(/detail/i), 'Test detail')
      await user.click(screen.getByLabelText(/none \(safe\/high-level\)/i))
      await user.click(screen.getByRole('button', { name: /submit difference/i }))

      await waitFor(() => {
        expect(mockApiDiffsCreate).toHaveBeenCalledWith({
          work: work.id,
          screen_work: screenWork.id,
          category: 'PLOT',
          claim: 'Test claim here',
          detail: 'Test detail',
          spoiler_scope: 'NONE',
        })
      })
    })

    it('shows loading state while submitting', async () => {
      const user = userEvent.setup()
      mockApiDiffsCreate.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<AddDiffForm work={work} screenWork={screenWork} />)

      await user.selectOptions(screen.getByLabelText(/category/i), 'PLOT')
      await user.type(screen.getByLabelText(/^claim/i), 'Valid claim here')
      await user.click(screen.getByRole('button', { name: /submit difference/i }))

      expect(screen.getByText(/submitting/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled()
    })

    it('shows success message after successful submission', async () => {
      const user = userEvent.setup()
      mockApiDiffsCreate.mockResolvedValue({
        id: 1,
        work: work.id,
        screen_work: screenWork.id,
        category: 'PLOT',
        claim: 'Test claim',
        detail: '',
        spoiler_scope: 'NONE',
        status: 'LIVE',
        created_by: 1,
        created_by_username: 'testuser',
        vote_counts: { accurate: 0, needs_nuance: 0, disagree: 0 },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      })

      render(<AddDiffForm work={work} screenWork={screenWork} />)

      await user.selectOptions(screen.getByLabelText(/category/i), 'PLOT')
      await user.type(screen.getByLabelText(/^claim/i), 'Valid claim here')
      await user.click(screen.getByRole('button', { name: /submit difference/i }))

      await waitFor(() => {
        expect(screen.getByText(/difference submitted successfully/i)).toBeInTheDocument()
      })
    })

    it('shows error message from server', async () => {
      const user = userEvent.setup()
      mockApiDiffsCreate.mockRejectedValue(
        new ApiError('This difference already exists', 400, { detail: 'Duplicate entry' })
      )

      render(<AddDiffForm work={work} screenWork={screenWork} />)

      await user.selectOptions(screen.getByLabelText(/category/i), 'PLOT')
      await user.type(screen.getByLabelText(/^claim/i), 'Valid claim here')
      await user.click(screen.getByRole('button', { name: /submit difference/i }))

      await waitFor(() => {
        expect(screen.getByText(/this difference already exists/i)).toBeInTheDocument()
      })
    })

    it('redirects after successful submission', async () => {
      const user = userEvent.setup()
      jest.useFakeTimers()

      mockApiDiffsCreate.mockResolvedValue({
        id: 1,
        work: work.id,
        screen_work: screenWork.id,
        category: 'PLOT',
        claim: 'Test claim',
        detail: '',
        spoiler_scope: 'NONE',
        status: 'LIVE',
        created_by: 1,
        created_by_username: 'testuser',
        vote_counts: { accurate: 0, needs_nuance: 0, disagree: 0 },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      })

      render(<AddDiffForm work={work} screenWork={screenWork} />)

      await user.selectOptions(screen.getByLabelText(/category/i), 'PLOT')
      await user.type(screen.getByLabelText(/^claim/i), 'Valid claim here')
      await user.click(screen.getByRole('button', { name: /submit difference/i }))

      await waitFor(() => {
        expect(screen.getByText(/difference submitted successfully/i)).toBeInTheDocument()
      })

      jest.advanceTimersByTime(1500)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(`/compare/${work.slug}/${screenWork.slug}`)
      })

      jest.useRealTimers()
    })
  })

  describe('LocalStorage draft functionality', () => {
    it('auto-saves draft to localStorage', async () => {
      const user = userEvent.setup()
      render(<AddDiffForm work={work} screenWork={screenWork} />)

      await user.selectOptions(screen.getByLabelText(/category/i), 'CHARACTER')
      await user.type(screen.getByLabelText(/^claim/i), 'Draft claim')

      const draftKey = `diff-draft-${work.id}-${screenWork.id}`

      await waitFor(() => {
        const savedDraft = localStorage.getItem(draftKey)
        expect(savedDraft).toBeTruthy()
        const draft = JSON.parse(savedDraft!)
        expect(draft.category).toBe('CHARACTER')
        expect(draft.claim).toBe('Draft claim')
      })
    })

    it('loads draft from localStorage on mount', () => {
      const draftKey = `diff-draft-${work.id}-${screenWork.id}`
      const draft = {
        category: 'PLOT',
        claim: 'Saved claim',
        detail: 'Saved detail',
        spoiler_scope: 'BOOK_ONLY',
      }
      localStorage.setItem(draftKey, JSON.stringify(draft))

      render(<AddDiffForm work={work} screenWork={screenWork} />)

      expect(screen.getByLabelText(/category/i)).toHaveValue('PLOT')
      expect(screen.getByLabelText(/^claim/i)).toHaveValue('Saved claim')
      expect(screen.getByLabelText(/detail/i)).toHaveValue('Saved detail')
      expect(screen.getByLabelText(/book only/i)).toBeChecked()
    })

    it('clears draft from localStorage after successful submission', async () => {
      const user = userEvent.setup()
      const draftKey = `diff-draft-${work.id}-${screenWork.id}`

      mockApiDiffsCreate.mockResolvedValue({
        id: 1,
        work: work.id,
        screen_work: screenWork.id,
        category: 'PLOT',
        claim: 'Test claim',
        detail: '',
        spoiler_scope: 'NONE',
        status: 'LIVE',
        created_by: 1,
        created_by_username: 'testuser',
        vote_counts: { accurate: 0, needs_nuance: 0, disagree: 0 },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      })

      render(<AddDiffForm work={work} screenWork={screenWork} />)

      await user.selectOptions(screen.getByLabelText(/category/i), 'PLOT')
      await user.type(screen.getByLabelText(/^claim/i), 'Valid claim here')
      await user.click(screen.getByRole('button', { name: /submit difference/i }))

      await waitFor(() => {
        expect(localStorage.getItem(draftKey)).toBeNull()
      })
    })
  })

  describe('Preview', () => {
    it('shows preview when claim is entered', async () => {
      const user = userEvent.setup()
      render(<AddDiffForm work={work} screenWork={screenWork} />)

      await user.selectOptions(screen.getByLabelText(/category/i), 'PLOT')
      await user.type(screen.getByLabelText(/^claim/i), 'Preview test claim')

      expect(screen.getByText('Preview')).toBeInTheDocument()
      expect(screen.getByText('Preview test claim')).toBeInTheDocument()
      expect(screen.getByText('PLOT')).toBeInTheDocument()
    })

    it('shows detail in preview when provided', async () => {
      const user = userEvent.setup()
      render(<AddDiffForm work={work} screenWork={screenWork} />)

      await user.type(screen.getByLabelText(/^claim/i), 'Preview claim')
      await user.type(screen.getByLabelText(/detail/i), 'Preview detail')

      const previews = screen.getAllByText('Preview detail')
      expect(previews.length).toBeGreaterThan(0)
    })
  })

  describe('Clear and Cancel functionality', () => {
    it('clears form when Clear button is clicked and confirmed', async () => {
      const user = userEvent.setup()
      global.confirm = jest.fn(() => true)

      render(<AddDiffForm work={work} screenWork={screenWork} />)

      await user.selectOptions(screen.getByLabelText(/category/i), 'PLOT')
      await user.type(screen.getByLabelText(/^claim/i), 'Test claim')

      await user.click(screen.getByRole('button', { name: /clear/i }))

      expect(screen.getByLabelText(/category/i)).toHaveValue('')
      expect(screen.getByLabelText(/^claim/i)).toHaveValue('')
    })

    it('navigates back when Cancel is clicked', async () => {
      const user = userEvent.setup()
      global.confirm = jest.fn(() => true)

      render(<AddDiffForm work={work} screenWork={screenWork} />)

      await user.type(screen.getByLabelText(/^claim/i), 'Test')
      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(mockPush).toHaveBeenCalledWith(`/compare/${work.slug}/${screenWork.slug}`)
    })
  })
})
