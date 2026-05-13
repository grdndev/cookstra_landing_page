import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext"
import { deleteUser, getUsers } from "../api/api"
import { useNavigate } from "react-router-dom";

type User = {
  id: string;
  email: string;
  role: 'admin' | 'hr' | 'freelance' | 'employer';
  validation_status?: 'pending' | 'approved' | 'rejected';
  freelance_siret?: string;
  employer_siret?: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { token } = useAuth()
  const navigate = useNavigate()

  async function loadUsers() {
    try {
      const response = await getUsers(token!)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(userId: string) {
    const response = await deleteUser(token!, userId)
    if (response.ok) loadUsers()
  }

  useEffect(() => {
    if (token) loadUsers()
  }, [token])

  if (loading) return <div className="animate-pulse">Chargement...</div>

  const q = search.toLowerCase()
  const matches = (u: User) =>
    !q ||
    u.email.toLowerCase().includes(q) ||
    (u.first_name ?? '').toLowerCase().includes(q) ||
    (u.last_name ?? '').toLowerCase().includes(q) ||
    (u.company_name ?? '').toLowerCase().includes(q) ||
    (u.freelance_siret ?? '').includes(q) ||
    (u.employer_siret ?? '').includes(q)

  const freelances = users.filter(u => u.role === 'freelance' && matches(u))
  const employers = users.filter(u => u.role === 'employer' && matches(u))

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2>Utilisateurs</h2>
        <div className="flex items-center gap-3 ml-auto">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="rounded-md border border-(--line-soft) bg-(--bg-panel) px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--accent)"
          />
          <button
            onClick={() => navigate('/users/new')}
            className="rounded-lg bg-(--accent) px-4 py-2 text-sm font-semibold text-white hover:bg-(--accent-strong) transition-colors whitespace-nowrap"
          >
            + Créer un compte
          </button>
        </div>
      </div>

      <UserSection
        title="Auto-entrepreneurs"
        users={freelances}
        siretKey="freelance_siret"
        nameKey="freelance"
        onEdit={id => navigate(`/users/${id}`)}
        onDocuments={id => navigate(`/users/${id}/documents`)}
        onDelete={handleDelete}
      />

      <UserSection
        title="Employeurs"
        users={employers}
        siretKey="employer_siret"
        nameKey="employer"
        onEdit={id => navigate(`/users/${id}`)}
        onDocuments={id => navigate(`/users/${id}/documents`)}
        onDelete={handleDelete}
      />
    </main>
  )
}

function UserSection({
  title, users, siretKey, nameKey, onEdit, onDocuments, onDelete,
}: {
  title: string
  users: User[]
  siretKey: 'freelance_siret' | 'employer_siret'
  nameKey: 'freelance' | 'employer'
  onEdit: (id: string) => void
  onDocuments: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-(--text-secondary) uppercase tracking-wide">
        {title} <span className="font-normal">({users.length})</span>
      </h3>

      {users.length === 0 ? (
        <p className="text-sm text-(--text-secondary)">Aucun résultat.</p>
      ) : (
        <table className="text-left border-separate border-spacing-y-2 text-sm w-full">
          <thead>
            <tr className="text-(--text-secondary)">
              <th className="pr-4 pb-1">{nameKey === 'freelance' ? 'Nom' : 'Entreprise'}</th>
              <th className="pr-4 pb-1">Email</th>
              <th className="pr-4 pb-1">SIRET</th>
              <th className="pr-4 pb-1">Statut</th>
              <th className="pb-1 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-(--line-soft)">
                <td className="pr-4 py-1.5 font-medium">
                  {nameKey === 'freelance'
                    ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || '—'
                    : user.company_name || '—'}
                </td>
                <td className="pr-4">{user.email}</td>
                <td className="pr-4 text-(--text-secondary)">{user[siretKey] || '—'}</td>
                <td className="pr-4">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    user.validation_status === 'approved' ? 'bg-green-500/15 text-green-400' :
                    user.validation_status === 'rejected' ? 'bg-red-500/15 text-red-400' :
                    'bg-yellow-500/15 text-yellow-400'
                  }`}>
                    {user.validation_status === 'approved' ? 'Approuvé' :
                     user.validation_status === 'rejected' ? 'Refusé' : 'En attente'}
                  </span>
                </td>
                <td className="py-1.5">
                  <div className="flex gap-2 justify-end">
                    <button className="border border-(--line-soft) rounded px-2 py-1 hover:bg-(--bg-panel-muted) transition-colors" onClick={() => onEdit(user.id)}>Modifier</button>
                    <button className="border border-(--line-soft) rounded px-2 py-1 hover:bg-(--bg-panel-muted) transition-colors" onClick={() => onDocuments(user.id)}>Documents</button>
                    <button className="border border-red-500/20 rounded px-2 py-1 text-red-500 hover:bg-red-500/10 transition-colors" onClick={() => onDelete(user.id)}>Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
