import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import SpoilerScopeToggle from './SpoilerScopeToggle'
import type { SpoilerScope } from '@/lib/types'

describe('SpoilerScopeToggle', () => {
  const mockOnScopeChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders all 4 scope options', () => {
      render(<SpoilerScopeToggle currentScope="NONE" onScopeChange={mockOnScopeChange} />)

      expect(screen.getByText('Safe')).toBeInTheDocument()
      expect(screen.getByText('Book Spoilers')).toBeInTheDocument()
      expect(screen.getByText('Screen Spoilers')).toBeInTheDocument()
      expect(screen.getByText('Full Spoilers')).toBeInTheDocument()
    })

    it('shows the heading "Spoiler Level"', () => {
      render(<SpoilerScopeToggle currentScope="NONE" onScopeChange={mockOnScopeChange} />)

      expect(screen.getByText('Spoiler Level')).toBeInTheDocument()
    })

    it('shows description for current scope on larger screens', () => {
      render(<SpoilerScopeToggle currentScope="NONE" onScopeChange={mockOnScopeChange} />)

      expect(screen.getByText('No spoilers - high-level changes only')).toBeInTheDocument()
    })

    it('shows current scope as selected', () => {
      render(<SpoilerScopeToggle currentScope="BOOK_ONLY" onScopeChange={mockOnScopeChange} />)

      const bookSpoilersButton = screen.getByRole('button', { name: /book spoilers/i })
      expect(bookSpoilersButton).toHaveClass('bg-link', 'text-white')
      expect(bookSpoilersButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('shows non-selected scopes with different styling', () => {
      render(<SpoilerScopeToggle currentScope="NONE" onScopeChange={mockOnScopeChange} />)

      const bookSpoilersButton = screen.getByRole('button', { name: /book spoilers/i })
      expect(bookSpoilersButton).not.toHaveClass('bg-link', 'text-white')
      expect(bookSpoilersButton).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('User interactions', () => {
    it('calls onScopeChange when a scope is clicked', async () => {
      const user = userEvent.setup()
      render(<SpoilerScopeToggle currentScope="NONE" onScopeChange={mockOnScopeChange} />)

      const bookSpoilersButton = screen.getByRole('button', { name: /book spoilers/i })
      await user.click(bookSpoilersButton)

      expect(mockOnScopeChange).toHaveBeenCalledWith('BOOK_ONLY')
    })

    it('calls onScopeChange with correct scope for each button', async () => {
      const user = userEvent.setup()
      render(<SpoilerScopeToggle currentScope="NONE" onScopeChange={mockOnScopeChange} />)

      // Test Safe button
      await user.click(screen.getByRole('button', { name: /^safe$/i }))
      expect(mockOnScopeChange).toHaveBeenLastCalledWith('NONE')

      // Test Book Spoilers button
      await user.click(screen.getByRole('button', { name: /book spoilers/i }))
      expect(mockOnScopeChange).toHaveBeenLastCalledWith('BOOK_ONLY')

      // Test Screen Spoilers button
      await user.click(screen.getByRole('button', { name: /screen spoilers/i }))
      expect(mockOnScopeChange).toHaveBeenLastCalledWith('SCREEN_ONLY')

      // Test Full Spoilers button
      await user.click(screen.getByRole('button', { name: /full spoilers/i }))
      expect(mockOnScopeChange).toHaveBeenLastCalledWith('FULL')

      expect(mockOnScopeChange).toHaveBeenCalledTimes(4)
    })

    it('updates description when different scope is selected', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <SpoilerScopeToggle currentScope="NONE" onScopeChange={mockOnScopeChange} />
      )

      expect(screen.getByText('No spoilers - high-level changes only')).toBeInTheDocument()

      // Simulate parent component updating currentScope
      rerender(<SpoilerScopeToggle currentScope="BOOK_ONLY" onScopeChange={mockOnScopeChange} />)

      expect(screen.getByText('Show book plot details')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('uses aria-pressed to indicate current selection', () => {
      render(<SpoilerScopeToggle currentScope="SCREEN_ONLY" onScopeChange={mockOnScopeChange} />)

      expect(screen.getByRole('button', { name: /^safe$/i })).toHaveAttribute('aria-pressed', 'false')
      expect(screen.getByRole('button', { name: /book spoilers/i })).toHaveAttribute('aria-pressed', 'false')
      expect(screen.getByRole('button', { name: /screen spoilers/i })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: /full spoilers/i })).toHaveAttribute('aria-pressed', 'false')
    })

    it('has descriptive title attributes with scope descriptions', () => {
      render(<SpoilerScopeToggle currentScope="NONE" onScopeChange={mockOnScopeChange} />)

      expect(screen.getByRole('button', { name: /^safe$/i })).toHaveAttribute('title', 'No spoilers - high-level changes only')
      expect(screen.getByRole('button', { name: /book spoilers/i })).toHaveAttribute('title', 'Show book plot details')
      expect(screen.getByRole('button', { name: /screen spoilers/i })).toHaveAttribute('title', 'Show movie/TV plot details')
      expect(screen.getByRole('button', { name: /full spoilers/i })).toHaveAttribute('title', 'Show everything including endings')
    })

    it('all buttons are keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<SpoilerScopeToggle currentScope="NONE" onScopeChange={mockOnScopeChange} />)

      const buttons = screen.getAllByRole('button').filter(btn => btn.getAttribute('aria-pressed') !== null)

      // Tab through all buttons and activate with Enter
      for (const button of buttons) {
        button.focus()
        await user.keyboard('{Enter}')
      }

      expect(mockOnScopeChange).toHaveBeenCalledTimes(4)
    })
  })

  describe('All scope options', () => {
    const scopes: Array<{ scope: SpoilerScope; label: string; description: string }> = [
      { scope: 'NONE', label: 'Safe', description: 'No spoilers - high-level changes only' },
      { scope: 'BOOK_ONLY', label: 'Book Spoilers', description: 'Show book plot details' },
      { scope: 'SCREEN_ONLY', label: 'Screen Spoilers', description: 'Show movie/TV plot details' },
      { scope: 'FULL', label: 'Full Spoilers', description: 'Show everything including endings' },
    ]

    scopes.forEach(({ scope, label, description }) => {
      it(`correctly renders ${label} scope`, () => {
        render(<SpoilerScopeToggle currentScope={scope} onScopeChange={mockOnScopeChange} />)

        const button = screen.getByRole('button', { name: new RegExp(label, 'i') })
        expect(button).toHaveAttribute('aria-pressed', 'true')
        expect(screen.getByText(description)).toBeInTheDocument()
      })
    })
  })
})
