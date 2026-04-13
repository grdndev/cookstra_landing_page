import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext"
import { getHRApplications } from "../api/api"

type Application = {
  id: string
  status: string
  created_at: string
  message: string | null
  mission_title: string
  mission_date: string
  city: string
  first_name: string
  last_name: string
  company_name: string
}

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  rejected: 'Refusée',
}

export default function HRPage() {
  const { token } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    getHRApplications(token!).then(r => r.json()).then(d => {
      if (d.success) { setApplications(d.data); setTotal(d.total) }
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="animate-pulse">Chargement...</div>

  return (
    <main className="flex flex-col gap-4">
      <h2>Candidatures <span className="text-base font-normal text-(--text-secondary)">({total})</span></h2>

      <table className="text-left border-separate border-spacing-y-2 text-sm w-full">
        <thead>
          <tr className="text-(--text-secondary)">
            <th className="pr-4">Freelance</th>
            <th className="pr-4">Mission</th>
            <th className="pr-4">Employeur</th>
            <th className="pr-4">Ville</th>
            <th className="pr-4">Date mission</th>
            <th className="pr-4">Statut</th>
            <th>Date candidature</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(a => (
            <tr key={a.id} className="border-b border-(--line-soft)">
              <td className="pr-4 py-1.5">{a.first_name} {a.last_name}</td>
              <td className="pr-4">{a.mission_title}</td>
              <td className="pr-4">{a.company_name}</td>
              <td className="pr-4">{a.city}</td>
              <td className="pr-4">{new Date(a.mission_date).toLocaleDateString('fr-FR')}</td>
              <td className="pr-4">{statusLabels[a.status] ?? a.status}</td>
              <td>{new Date(a.created_at).toLocaleDateString('fr-FR')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {applications.length === 0 && <p className="text-(--text-secondary)">Aucune candidature.</p>}
    </main>
  )
}
