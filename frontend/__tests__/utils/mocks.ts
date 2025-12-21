import { api } from '@/lib/api'

// Mock API module
export const mockApi = {
  diffs: {
    vote: jest.fn(),
    create: jest.fn(),
    list: jest.fn(),
  },
  comments: {
    list: jest.fn(),
    create: jest.fn(),
  },
  auth: {
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
  },
  works: {
    list: jest.fn(),
    get: jest.fn(),
  },
  screen: {
    list: jest.fn(),
    get: jest.fn(),
  },
}

// Setup mock for @/lib/api
jest.mock('@/lib/api', () => ({
  api: mockApi,
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
  tokenManager: {
    setToken: jest.fn(),
    getToken: jest.fn(),
    clearToken: jest.fn(),
  },
}))

// Mock AuthContext
export const mockAuthContext = {
  isAuthenticated: false,
  user: null,
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  isLoading: false,
}

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => mockAuthContext,
}))

// Reset all mocks between tests
export const resetAllMocks = () => {
  Object.values(mockApi.diffs).forEach(mock => mock.mockReset())
  Object.values(mockApi.comments).forEach(mock => mock.mockReset())
  Object.values(mockApi.auth).forEach(mock => mock.mockReset())
  Object.values(mockApi.works).forEach(mock => mock.mockReset())
  Object.values(mockApi.screen).forEach(mock => mock.mockReset())

  mockAuthContext.isAuthenticated = false
  mockAuthContext.user = null
  mockAuthContext.login.mockReset()
  mockAuthContext.signup.mockReset()
  mockAuthContext.logout.mockReset()
  mockAuthContext.isLoading = false
}
