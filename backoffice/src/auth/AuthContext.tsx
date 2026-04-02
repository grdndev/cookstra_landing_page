import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type AuthUser = {
  email: string
  role: string
}

type AuthContextType = {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (user: AuthUser, token: string) => void
  logout: () => void
}

const AUTH_STORAGE_KEY = 'backoffice.auth'

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)

    try {
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth)

        if (parsed?.token && parsed?.user) {
          setToken(parsed.token)
          setUser(parsed.user)
        }
      }
    } catch (error) {
      console.error('Failed to parse auth data from localStorage:', error)
      localStorage.removeItem(AUTH_STORAGE_KEY)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (nextUser: AuthUser, nextToken: string) => {
    setUser(nextUser)
    setToken(nextToken)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: nextUser, token: nextToken }))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
    }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}