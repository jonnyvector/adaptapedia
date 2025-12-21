import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import type { DiffItem, Comment, Work, ScreenWork, User } from '@/lib/types'

// Mock AuthContext Provider
const MockAuthProvider = ({ children, value }: any) => {
  const defaultValue = {
    isAuthenticated: false,
    user: null,
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
    ...value,
  }

  const AuthContext = React.createContext(defaultValue)
  return <AuthContext.Provider value={defaultValue}>{children}</AuthContext.Provider>
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValue?: any
}

// Custom render function with providers
export function renderWithProviders(
  ui: ReactElement,
  { authValue, ...renderOptions }: CustomRenderOptions = {}
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <MockAuthProvider value={authValue}>{children}</MockAuthProvider>
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock data factories
export const mockDiffItem = (overrides?: Partial<DiffItem>): DiffItem => ({
  id: 1,
  work: 1,
  screen_work: 1,
  work_title: 'The Lord of the Rings',
  work_slug: 'the-lord-of-the-rings',
  screen_work_title: 'The Lord of the Rings: The Fellowship of the Ring',
  screen_work_slug: 'the-lord-of-the-rings-the-fellowship-of-the-ring',
  category: 'PLOT',
  claim: 'Tom Bombadil is completely absent from the film adaptation',
  detail: 'The character of Tom Bombadil, who helps the hobbits in the Old Forest and saves them from the Barrow-wights in the book, does not appear in the film at all.',
  spoiler_scope: 'NONE',
  status: 'LIVE',
  created_by: 1,
  created_by_username: 'testuser',
  vote_counts: {
    accurate: 10,
    needs_nuance: 2,
    disagree: 1,
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const mockComment = (overrides?: Partial<Comment>): Comment => ({
  id: 1,
  diff_item: 1,
  user: 1,
  username: 'testuser',
  body: 'This is a test comment',
  spoiler_scope: 'NONE',
  status: 'LIVE',
  created_at: '2024-01-01T00:00:00Z',
  diff_item_claim: 'Test claim',
  work_title: 'The Lord of the Rings',
  work_slug: 'the-lord-of-the-rings',
  screen_work_title: 'The Fellowship of the Ring',
  screen_work_slug: 'the-fellowship-of-the-ring',
  ...overrides,
})

export const mockWork = (overrides?: Partial<Work>): Work => ({
  id: 1,
  title: 'The Lord of the Rings',
  slug: 'the-lord-of-the-rings',
  summary: 'A fantasy novel about hobbits and a ring',
  year: 1954,
  language: 'English',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const mockScreenWork = (overrides?: Partial<ScreenWork>): ScreenWork => ({
  id: 1,
  type: 'MOVIE',
  title: 'The Lord of the Rings: The Fellowship of the Ring',
  slug: 'the-lord-of-the-rings-the-fellowship-of-the-ring',
  summary: 'The film adaptation of the first book',
  year: 2001,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const mockUser = (overrides?: Partial<User>): User => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'USER',
  reputation_points: 100,
  spoiler_preference: 'NONE',
  date_joined: '2024-01-01T00:00:00Z',
  ...overrides,
})

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { renderWithProviders as render }
