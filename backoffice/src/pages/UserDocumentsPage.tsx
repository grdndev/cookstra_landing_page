import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext"
import { getUserDocuments, patchDocument } from "../api/api"
import { useParams, useNavigate } from "react-router-dom"

type Document = {
  id: string
  type: string
  file_url: string
  created_at: string
  status: string
  email: string
  first_name: string | null
  last_name: string | null
}

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
}

const docTypeLabels: Record<string, string> = {
  identity: "Pièce d'identité",
  kbis: 'Kbis',
  rib: 'RIB',
  photo: 'Photo',
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function UserDocumentsPage() {
  const { userId } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  async function load() {
    const r = await getUserDocuments(token!, userId!)
    const d = await r.json()
    if (d.success) {
      setDocs(d.data)
      if (d.data.length > 0) {
        const u = d.data[0]
        setUserName(u.first_name ? `${u.first_name} ${u.last_name ?? ''}`.trim() : u.email)
      }
    }
    setLoading(false)
  }

  useEffect(() => { if (token) load() }, [token])

  async function handleStatus(id: string, status: string) {
    await patchDocument(token!, id, status)
    load()
  }

  if (loading) return <div className="animate-pulse">Chargement...</div>

  return (
    <main className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/users/${userId}`)}
          className="text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors"
        >
          ← {userName || 'Utilisateur'}
        </button>
        <span className="text-(--text-secondary)">/</span>
        <h2 className="text-lg font-semibold">Documents</h2>
        <span className="text-base font-normal text-(--text-secondary)">({docs.length})</span>
      </div>

      {docs.length === 0 ? (
        <p className="text-(--text-secondary)">Aucun document.</p>
      ) : (
        <table className="text-left border-separate border-spacing-y-2 text-sm w-full">
          <thead>
            <tr className="text-(--text-secondary)">
              <th className="pr-4">Type</th>
              <th className="pr-4">Statut</th>
              <th className="pr-4">Date</th>
              <th className="pr-4">Fichier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map(d => (
              <tr key={d.id} className="border-b border-(--line-soft)">
                <td className="pr-4 py-1.5">{docTypeLabels[d.type] ?? d.type}</td>
                <td className="pr-4">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    d.status === 'approved' ? 'bg-green-500/15 text-green-400' :
                    d.status === 'rejected' ? 'bg-red-500/15 text-red-400' :
                    'bg-yellow-500/15 text-yellow-400'
                  }`}>
                    {statusLabels[d.status] ?? d.status ?? '—'}
                  </span>
                </td>
                <td className="pr-4">{new Date(d.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="pr-4">
                  {d.file_url
                    ? <a href={`${API_URL}${d.file_url}`} target="_blank" rel="noreferrer" className="text-(--accent) underline hover:text-(--accent-strong) transition-colors">Voir →</a>
                    : '—'}
                </td>
                <td className="flex gap-1 py-1.5">
                  {d.status !== 'approved' && (
                    <button onClick={() => handleStatus(d.id, 'approved')} className="rounded border border-green-500/40 px-2 py-0.5 text-xs text-green-400 hover:bg-green-500/10 transition-colors">
                      Approuver
                    </button>
                  )}
                  {d.status !== 'rejected' && (
                    <button onClick={() => handleStatus(d.id, 'rejected')} className="rounded border border-red-500/40 px-2 py-0.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                      Rejeter
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
