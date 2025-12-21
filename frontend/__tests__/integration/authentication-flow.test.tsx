/**
 * Integration test: Authentication flow
 * Tests login, signup, and authentication-gated actions
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'
import { ApiError } from '@/lib/api'

// Mock dependencies
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const mockLogin = jest.fn()
const mockSignup = jest.fn()

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    login: mockLogin,
    signup: mockSignup,
    isAuthenticated: false,
    user: null,
    logout: jest.fn(),
    isLoading: false,
  }),
}))

describe('Integration: Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Login flow', () => {
    it('completes successful login flow', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(undefined)

      render(<LoginForm redirectTo="/profile" />)

      // Step 1: User fills in username
      await user.type(screen.getByLabelText(/username/i), 'testuser')

      // Step 2: User fills in password
      await user.type(screen.getByLabelText(/password/i), 'password123')

      // Step 3: User submits form
      await user.click(screen.getByRole('button', { name: /log in/i }))

      // Step 4: Loading state is shown
      expect(screen.getByText(/logging in/i)).toBeInTheDocument()

      // Step 5: Login is called with credentials
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123',
        })
      })

      // Step 6: User is redirected
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/profile')
      })
    })

    it('handles login failure and allows retry', async () => {
      const user = userEvent.setup()
      mockLogin
        .mockRejectedValueOnce(new ApiError('Invalid credentials', 401))
        .mockResolvedValueOnce(undefined)

      render(<LoginForm />)

      // First attempt - fails
      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument()
      })

      // Form should be re-enabled
      expect(screen.getByLabelText(/username/i)).not.toBeDisabled()

      // Second attempt - succeeds
      await user.clear(screen.getByLabelText(/password/i))
      await user.type(screen.getByLabelText(/password/i), 'correctpassword')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledTimes(2)
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })
  })

  describe('Signup flow', () => {
    it('completes successful signup flow', async () => {
      const user = userEvent.setup()
      mockSignup.mockResolvedValue(undefined)

      render(<SignupForm redirectTo="/welcome" />)

      // Step 1: User fills in username
      await user.type(screen.getByLabelText(/^username$/i), 'newuser')

      // Step 2: User fills in email
      await user.type(screen.getByLabelText(/^email$/i), 'newuser@example.com')

      // Step 3: User fills in password
      await user.type(screen.getByLabelText(/^password$/i), 'password123')

      // Step 4: User confirms password
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')

      // Step 5: User submits form
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      // Step 6: Loading state is shown
      expect(screen.getByText(/creating account/i)).toBeInTheDocument()

      // Step 7: Signup is called with correct data
      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
          password_confirm: 'password123',
        })
      })

      // Step 8: User is redirected
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/welcome')
      })
    })

    it('validates form before submission', async () => {
      const user = userEvent.setup()
      mockSignup.mockResolvedValue(undefined)

      render(<SignupForm />)

      // Try to submit with invalid data
      await user.type(screen.getByLabelText(/^username$/i), 'ab') // too short
      await user.type(screen.getByLabelText(/^email$/i), 'bademail') // invalid
      await user.type(screen.getByLabelText(/^password$/i), 'pass') // too short
      await user.type(screen.getByLabelText(/confirm password/i), 'different') // doesn't match

      await user.click(screen.getByRole('button', { name: /sign up/i }))

      // Validation errors should be shown
      await waitFor(() => {
        expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument()
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })

      // Signup should not be called
      expect(mockSignup).not.toHaveBeenCalled()
    })

    it('handles server-side validation errors', async () => {
      const user = userEvent.setup()
      mockSignup.mockRejectedValue(
        new ApiError('Validation failed', 400, {
          username: ['Username already exists'],
          email: ['Email already registered'],
        })
      )

      render(<SignupForm />)

      await user.type(screen.getByLabelText(/^username$/i), 'existinguser')
      await user.type(screen.getByLabelText(/^email$/i), 'existing@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByText(/username already exists/i)).toBeInTheDocument()
        expect(screen.getByText(/email already registered/i)).toBeInTheDocument()
      })

      // Form should be re-enabled for corrections
      expect(screen.getByLabelText(/^username$/i)).not.toBeDisabled()
    })
  })

  describe('Navigation between login and signup', () => {
    it('allows user to navigate from login to signup', async () => {
      const user = userEvent.setup()

      const { rerender } = render(<LoginForm />)

      // User sees link to signup
      const signupLink = screen.getByRole('link', { name: /sign up/i })
      expect(signupLink).toHaveAttribute('href', '/auth/signup')

      // Simulate navigation
      rerender(<SignupForm />)

      // User is now on signup page
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    })

    it('allows user to navigate from signup to login', async () => {
      const user = userEvent.setup()

      const { rerender } = render(<SignupForm />)

      // User sees link to login
      const loginLink = screen.getByRole('link', { name: /log in/i })
      expect(loginLink).toHaveAttribute('href', '/auth/login')

      // Simulate navigation
      rerender(<LoginForm />)

      // User is now on login page
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
      expect(screen.queryByLabelText(/^email$/i)).not.toBeInTheDocument() // email not on login
    })
  })

  describe('Password validation', () => {
    it('validates password strength on signup', async () => {
      const user = userEvent.setup()

      render(<SignupForm />)

      // Weak password
      await user.type(screen.getByLabelText(/^username$/i), 'testuser')
      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'weak')
      await user.type(screen.getByLabelText(/confirm password/i), 'weak')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
      })
    })

    it('validates password confirmation match', async () => {
      const user = userEvent.setup()

      render(<SignupForm />)

      await user.type(screen.getByLabelText(/^username$/i), 'testuser')
      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'goodpassword123')
      await user.type(screen.getByLabelText(/confirm password/i), 'differentpassword')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form accessibility', () => {
    it('clears errors when user starts typing after validation failure', async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValue(new ApiError('Invalid credentials', 401))

      render(<LoginForm />)

      // Trigger error
      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'wrongpass')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument()
      })

      // Start typing again - error should clear
      await user.type(screen.getByLabelText(/username/i), 'x')

      expect(screen.queryByText(/invalid username or password/i)).not.toBeInTheDocument()
    })

    it('maintains focus on submit button during loading', async () => {
      const user = userEvent.setup()
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<LoginForm />)

      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'password')

      const submitButton = screen.getByRole('button', { name: /log in/i })
      await user.click(submitButton)

      // Button should be disabled but still in DOM
      expect(submitButton).toBeDisabled()
      expect(submitButton).toBeInTheDocument()
    })
  })
})
