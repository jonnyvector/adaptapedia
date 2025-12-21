import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import LoginForm from './LoginForm'
import { ApiError } from '@/lib/api'

// Mock dependencies
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const mockLogin = jest.fn()
jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    user: null,
    signup: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
  }),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders all form fields', () => {
      render(<LoginForm />)

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('renders submit button', () => {
      render(<LoginForm />)

      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    })

    it('renders link to signup page', () => {
      render(<LoginForm />)

      const signupLink = screen.getByRole('link', { name: /sign up/i })
      expect(signupLink).toHaveAttribute('href', '/auth/signup')
    })

    it('has proper input types', () => {
      render(<LoginForm />)

      expect(screen.getByLabelText(/username/i)).toHaveAttribute('type', 'text')
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password')
    })

    it('has proper autocomplete attributes', () => {
      render(<LoginForm />)

      expect(screen.getByLabelText(/username/i)).toHaveAttribute('autocomplete', 'username')
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('autocomplete', 'current-password')
    })
  })

  describe('Form validation', () => {
    it('requires username field', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const submitButton = screen.getByRole('button', { name: /log in/i })
      await user.click(submitButton)

      // HTML5 validation should prevent submission
      const usernameInput = screen.getByLabelText(/username/i)
      expect(usernameInput).toBeRequired()
    })

    it('requires password field', () => {
      render(<LoginForm />)

      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toBeRequired()
    })
  })

  describe('Form submission', () => {
    it('submits credentials when form is filled', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(undefined)

      render(<LoginForm />)

      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123',
        })
      })
    })

    it('shows loading state while submitting', async () => {
      const user = userEvent.setup()
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<LoginForm />)

      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      expect(screen.getByText(/logging in/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled()
    })

    it('redirects to default path after successful login', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(undefined)

      render(<LoginForm />)

      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('redirects to custom path after successful login', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(undefined)

      render(<LoginForm redirectTo="/profile" />)

      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/profile')
      })
    })

    it('disables inputs while submitting', async () => {
      const user = userEvent.setup()
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<LoginForm />)

      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      expect(screen.getByLabelText(/username/i)).toBeDisabled()
      expect(screen.getByLabelText(/password/i)).toBeDisabled()
    })
  })

  describe('Error handling', () => {
    it('shows error message for invalid credentials (401)', async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValue(new ApiError('Unauthorized', 401))

      render(<LoginForm />)

      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument()
      })
    })

    it('shows error message from API response', async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValue(
        new ApiError('Login failed', 400, { username: ['This field is required'] })
      )

      render(<LoginForm />)

      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(screen.getByText(/this field is required/i)).toBeInTheDocument()
      })
    })

    it('shows generic error message for unknown errors', async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValue(new Error('Network error'))

      render(<LoginForm />)

      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument()
      })
    })

    it('re-enables form after error', async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValue(new ApiError('Login failed', 401))

      render(<LoginForm />)

      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/username/i)).not.toBeDisabled()
        expect(screen.getByLabelText(/password/i)).not.toBeDisabled()
        expect(screen.getByRole('button', { name: /log in/i })).not.toBeDisabled()
      })
    })

    it('clears error when user starts typing', async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValue(new ApiError('Login failed', 401))

      render(<LoginForm />)

      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument()
      })

      // Error should clear when user types again
      await user.type(screen.getByLabelText(/username/i), 'x')

      expect(screen.queryByText(/invalid username or password/i)).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper labels for form fields', () => {
      render(<LoginForm />)

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('error message is visible and accessible', async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValue(new ApiError('Login failed', 401))

      render(<LoginForm />)

      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        const errorMessage = screen.getByText(/invalid username or password/i)
        expect(errorMessage).toBeVisible()
      })
    })
  })
})
