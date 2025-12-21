import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import SignupForm from './SignupForm'
import { ApiError } from '@/lib/api'

// Mock dependencies
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const mockSignup = jest.fn()
jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    signup: mockSignup,
    isAuthenticated: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
  }),
}))

describe('SignupForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders all form fields', () => {
      render(<SignupForm />)

      expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    })

    it('renders submit button', () => {
      render(<SignupForm />)

      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
    })

    it('renders link to login page', () => {
      render(<SignupForm />)

      const loginLink = screen.getByRole('link', { name: /log in/i })
      expect(loginLink).toHaveAttribute('href', '/auth/login')
    })

    it('shows password requirements hint', () => {
      render(<SignupForm />)

      expect(screen.getByText(/must be at least 8 characters/i)).toBeInTheDocument()
    })

    it('has proper input types', () => {
      render(<SignupForm />)

      expect(screen.getByLabelText(/^username$/i)).toHaveAttribute('type', 'text')
      expect(screen.getByLabelText(/^email$/i)).toHaveAttribute('type', 'email')
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password')
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('type', 'password')
    })

    it('has proper autocomplete attributes', () => {
      render(<SignupForm />)

      expect(screen.getByLabelText(/^username$/i)).toHaveAttribute('autocomplete', 'username')
      expect(screen.getByLabelText(/^email$/i)).toHaveAttribute('autocomplete', 'email')
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('autocomplete', 'new-password')
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('autocomplete', 'new-password')
    })
  })

  describe('Client-side validation', () => {
    it('validates username minimum length (3 characters)', async () => {
      const user = userEvent.setup()
      render(<SignupForm />)

      await user.type(screen.getByLabelText(/^username$/i), 'ab')
      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument()
      })
      expect(mockSignup).not.toHaveBeenCalled()
    })

    it('validates email format', async () => {
      const user = userEvent.setup()
      render(<SignupForm />)

      await user.type(screen.getByLabelText(/^username$/i), 'testuser')
      await user.type(screen.getByLabelText(/^email$/i), 'invalidemail')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })
      expect(mockSignup).not.toHaveBeenCalled()
    })

    it('validates password minimum length (8 characters)', async () => {
      const user = userEvent.setup()
      render(<SignupForm />)

      await user.type(screen.getByLabelText(/^username$/i), 'testuser')
      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'pass123')
      await user.type(screen.getByLabelText(/confirm password/i), 'pass123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
      })
      expect(mockSignup).not.toHaveBeenCalled()
    })

    it('validates password confirmation match', async () => {
      const user = userEvent.setup()
      render(<SignupForm />)

      await user.type(screen.getByLabelText(/^username$/i), 'testuser')
      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'differentpassword')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })
      expect(mockSignup).not.toHaveBeenCalled()
    })

    it('shows validation errors with red border on fields', async () => {
      const user = userEvent.setup()
      render(<SignupForm />)

      await user.type(screen.getByLabelText(/^username$/i), 'ab')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        const usernameInput = screen.getByLabelText(/^username$/i)
        expect(usernameInput).toHaveClass('border-red-500')
      })
    })
  })

  describe('Form submission', () => {
    it('submits valid form data', async () => {
      const user = userEvent.setup()
      mockSignup.mockResolvedValue(undefined)

      render(<SignupForm />)

      await user.type(screen.getByLabelText(/^username$/i), 'newuser')
      await user.type(screen.getByLabelText(/^email$/i), 'newuser@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
          password_confirm: 'password123',
        })
      })
    })

    it('shows loading state while submitting', async () => {
      const user = userEvent.setup()
      mockSignup.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<SignupForm />)

      await user.type(screen.getByLabelText(/^username$/i), 'newuser')
      await user.type(screen.getByLabelText(/^email$/i), 'newuser@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      expect(screen.getByText(/creating account/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled()
    })

    it('redirects to default path after successful signup', async () => {
      const user = userEvent.setup()
      mockSignup.mockResolvedValue(undefined)

      render(<SignupForm />)

      await user.type(screen.getByLabelText(/^username$/i), 'newuser')
      await user.type(screen.getByLabelText(/^email$/i), 'newuser@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('redirects to custom path after successful signup', async () => {
      const user = userEvent.setup()
      mockSignup.mockResolvedValue(undefined)

      render(<SignupForm redirectTo="/welcome" />)

      await user.type(screen.getByLabelText(/^username$/i), 'newuser')
      await user.type(screen.getByLabelText(/^email$/i), 'newuser@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/welcome')
      })
    })

    it('disables inputs while submitting', async () => {
      const user = userEvent.setup()
      mockSignup.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<SignupForm />)

      await user.type(screen.getByLabelText(/^username$/i), 'newuser')
      await user.type(screen.getByLabelText(/^email$/i), 'newuser@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      expect(screen.getByLabelText(/^username$/i)).toBeDisabled()
      expect(screen.getByLabelText(/^email$/i)).toBeDisabled()
      expect(screen.getByLabelText(/^password$/i)).toBeDisabled()
      expect(screen.getByLabelText(/confirm password/i)).toBeDisabled()
    })
  })

  describe('Server-side error handling', () => {
    it('shows field-specific errors from API', async () => {
      const user = userEvent.setup()
      mockSignup.mockRejectedValue(
        new ApiError('Validation failed', 400, {
          username: ['This username is already taken'],
          email: ['This email is already registered'],
        })
      )

      render(<SignupForm />)

      await user.type(screen.getByLabelText(/^username$/i), 'existinguser')
      await user.type(screen.getByLabelText(/^email$/i), 'existing@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByText(/this username is already taken/i)).toBeInTheDocument()
        expect(screen.getByText(/this email is already registered/i)).toBeInTheDocument()
      })
    })

    it('shows general error message for non-field errors', async () => {
      const user = userEvent.setup()
      mockSignup.mockRejectedValue(new ApiError('Signup failed', 500))

      render(<SignupForm />)

      await user.type(screen.getByLabelText(/^username$/i), 'newuser')
      await user.type(screen.getByLabelText(/^email$/i), 'newuser@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByText(/signup failed/i)).toBeInTheDocument()
      })
    })

    it('shows generic error for unexpected errors', async () => {
      const user = userEvent.setup()
      mockSignup.mockRejectedValue(new Error('Network error'))

      render(<SignupForm />)

      await user.type(screen.getByLabelText(/^username$/i), 'newuser')
      await user.type(screen.getByLabelText(/^email$/i), 'newuser@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument()
      })
    })

    it('re-enables form after error', async () => {
      const user = userEvent.setup()
      mockSignup.mockRejectedValue(new ApiError('Signup failed', 400))

      render(<SignupForm />)

      await user.type(screen.getByLabelText(/^username$/i), 'newuser')
      await user.type(screen.getByLabelText(/^email$/i), 'newuser@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/^username$/i)).not.toBeDisabled()
        expect(screen.getByLabelText(/^email$/i)).not.toBeDisabled()
        expect(screen.getByLabelText(/^password$/i)).not.toBeDisabled()
        expect(screen.getByLabelText(/confirm password/i)).not.toBeDisabled()
        expect(screen.getByRole('button', { name: /sign up/i })).not.toBeDisabled()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper labels for all form fields', () => {
      render(<SignupForm />)

      expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    })

    it('shows inline error messages below fields', async () => {
      const user = userEvent.setup()
      render(<SignupForm />)

      await user.type(screen.getByLabelText(/^username$/i), 'ab')
      await user.type(screen.getByLabelText(/^password$/i), 'short')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        const usernameError = screen.getByText(/username must be at least 3 characters/i)
        const passwordError = screen.getByText(/password must be at least 8 characters/i)

        expect(usernameError).toBeVisible()
        expect(passwordError).toBeVisible()
      })
    })

    it('marks required fields', () => {
      render(<SignupForm />)

      expect(screen.getByLabelText(/^username$/i)).toBeRequired()
      expect(screen.getByLabelText(/^email$/i)).toBeRequired()
      expect(screen.getByLabelText(/^password$/i)).toBeRequired()
      expect(screen.getByLabelText(/confirm password/i)).toBeRequired()
    })
  })

  describe('Multiple validation errors', () => {
    it('shows all validation errors at once', async () => {
      const user = userEvent.setup()
      render(<SignupForm />)

      await user.type(screen.getByLabelText(/^username$/i), 'ab')
      await user.type(screen.getByLabelText(/^email$/i), 'bademail')
      await user.type(screen.getByLabelText(/^password$/i), 'short')
      await user.type(screen.getByLabelText(/confirm password/i), 'different')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument()
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })
    })
  })
})
