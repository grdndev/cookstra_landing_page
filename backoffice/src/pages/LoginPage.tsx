import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { postLogin } from '../api/api'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await postLogin(email, password)
      const data = await response.json()

      if (!response.ok) {
        const message = data?.error || 'Unable to sign in.'
        throw new Error(message)
      }

      console.log("response", data)

      if (!['admin', 'hr'].includes(data.data.user.role)) {
        throw new Error('Accès réservé aux administrateurs et RH.')
      }
      login(data.data.user, data.data.token)
      navigate('/', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section
        className="w-full max-w-120 rounded-lg border border-(--line-soft) bg-(--bg-panel) p-[clamp(22px,4vw,34px)] shadow-(--shadow-soft) [background:linear-gradient(145deg,rgba(20,122,115,0.08),transparent_60%),var(--bg-panel)]"
        aria-labelledby="login-title"
      >
        <p className="mb-2.5 text-[0.74rem] font-bold uppercase tracking-[0.09em] text-(--accent)">Cookstra Backoffice</p>
        <h1 id="login-title" className="text-[clamp(1.75rem,4vw,2.3rem)]">
          Welcome back
        </h1>
        <p className="mt-3 text-(--text-secondary)">
          Sign in to manage menus, orders, and team operations.
        </p>

        <form className="mt-6 grid gap-2.5" onSubmit={handleSubmit}>
          <label className="text-[0.88rem] font-bold" htmlFor="email">
            Email
          </label>
          <input
            className="min-h-11.5 rounded-xl border border-(--line-soft) bg-white px-3.5 text-(--text-primary) focus:border-(--accent) focus:outline-2 focus:outline-[rgba(20,122,115,0.25)]"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="admin@cookstra.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label className="text-[0.88rem] font-bold" htmlFor="password">
            Password
          </label>
          <input
            className="min-h-11.5 rounded-xl border border-(--line-soft) bg-white px-3.5 text-(--text-primary) focus:border-(--accent) focus:outline-2 focus:outline-[rgba(20,122,115,0.25)]"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error ? (
            <p className="text-[0.9rem] font-semibold text-[#af2a2a]" role="alert">
              {error}
            </p>
          ) : null}

          <button
            className="min-h-11.5 cursor-pointer rounded-xl bg-(--accent) font-bold text-[#fdfdfc] transition-[transform,background-color] duration-150 hover:-translate-y-px hover:bg-(--accent-strong) disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}
