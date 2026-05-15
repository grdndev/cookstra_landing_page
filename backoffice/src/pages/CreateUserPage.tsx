import { useState } from "react"
import { useAuth } from "../auth/AuthContext"
import { createUser } from "../api/api"
import { useNavigate } from "react-router-dom"

const roles = [
  { value: 'hr', label: 'Ressources humaines (RH)' },
  { value: 'employer', label: 'Employeur' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'admin', label: 'Administrateur' },
]

export default function CreateUserPage() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('hr')
  const [siret, setSiret] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password || !siret) {
      setError('Email, mot de passe et SIRET requis')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await createUser(token!, { email, password, role, siret })
      const data = await res.json()
      if (data.success) {
        setSuccess(`Compte créé : ${email}`)
        setEmail('')
        setPassword('')
        setRole('hr')
        setSiret('')
      } else {
        setError(data.message || 'Erreur création compte')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="flex flex-col gap-6 max-w-lg">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/users')}
          className="text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors"
        >
          ← Utilisateurs
        </button>
        <span className="text-(--text-secondary)">/</span>
        <h2 className="text-lg font-semibold">Créer un compte</h2>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="exemple@email.com"
            className="rounded-md border border-(--line-soft) bg-(--bg-panel) px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--accent)"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Mot de passe</span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="rounded-md border border-(--line-soft) bg-(--bg-panel) px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--accent)"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">SIRET</span>
          <input
            type="text"
            value={siret}
            onChange={e => setSiret(e.target.value)}
            placeholder="12345678901234"
            maxLength={14}
            className="rounded-md border border-(--line-soft) bg-(--bg-panel) px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--accent)"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Rôle</span>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="rounded-md border border-(--line-soft) bg-(--bg-panel) px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--accent)"
          >
            {roles.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600 font-medium">{success}</p>}

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-(--accent) px-5 py-2 text-sm font-semibold text-white hover:bg-(--accent-strong) disabled:opacity-50 transition-colors"
          >
            {saving ? 'Création...' : 'Créer le compte'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="rounded-lg border border-(--line-soft) px-5 py-2 text-sm font-medium hover:bg-(--bg-panel) transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </main>
  )
}
