import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext"
import { getDocuments, patchDocument } from "../api/api"

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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function DocumentsPage() {
  const { token } = useAuth()
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  async function load() {
    const r = await getDocuments(token!)
    const d = await r.json()
    if (d.success) { setDocs(d.data); setTotal(d.total) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleStatus(id: string, status: string) {
    await patchDocument(token!, id, status)
    load()
  }

  if (loading) return <div className="animate-pulse">Chargement...</div>

  return (
    <main className="flex flex-col gap-4">
      <h2>Documents <span className="text-base font-normal text-(--text-secondary)">({total})</span></h2>

      <table className="text-left border-separate border-spacing-y-2 text-sm w-full">
        <thead>
          <tr className="text-(--text-secondary)">
            <th className="pr-4">Freelance</th>
            <th className="pr-4">Email</th>
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
              <td className="pr-4 py-1.5">{d.first_name ? `${d.first_name} ${d.last_name}` : '—'}</td>
              <td className="pr-4">{d.email}</td>
              <td className="pr-4">{d.type}</td>
              <td className="pr-4">{statusLabels[d.status] ?? d.status ?? '—'}</td>
              <td className="pr-4">{new Date(d.created_at).toLocaleDateString('fr-FR')}</td>
              <td className="pr-4">
                {d.file_url ? <a href={`${API_URL}${d.file_url}`} target="_blank" rel="noreferrer" className="underline">Voir</a> : '—'}
              </td>
              <td className="flex gap-1 py-1.5">
                {d.status !== 'approved' && (
                  <button onClick={() => handleStatus(d.id, 'approved')} className="rounded border border-green-300 px-2 py-0.5 text-xs text-green-700 hover:bg-green-50">Approuver</button>
                )}
                {d.status !== 'rejected' && (
                  <button onClick={() => handleStatus(d.id, 'rejected')} className="rounded border border-red-300 px-2 py-0.5 text-xs text-red-600 hover:bg-red-50">Rejeter</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {docs.length === 0 && <p className="text-(--text-secondary)">Aucun document.</p>}
    </main>
  )
}
