import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext"
import { deleteMission, getMissions, patchMission } from "../api/api"

type Mission = {
  id: string
  title: string
  date: string
  city: string
  status: string
  hourly_rate: number
  company_name: string
  mission_type: string
  freelance_first_name: string | null
  freelance_last_name: string | null
}

const statusLabels: Record<string, string> = {
  open: 'Ouverte',
  filled: 'Pourvue',
  in_progress: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
}

export default function MissionsPage() {
  const { token } = useAuth()
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  async function load() {
    const r = await getMissions(token!)
    const d = await r.json()
    if (d.success) { setMissions(d.data); setTotal(d.total) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleStatus(id: string, status: string) {
    await patchMission(token!, id, status)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette mission ?')) return
    await deleteMission(token!, id)
    load()
  }

  if (loading) return <div className="animate-pulse">Chargement...</div>

  return (
    <main className="flex flex-col gap-4">
      <h2>Missions <span className="text-base font-normal text-(--text-secondary)">({total})</span></h2>

      <table className="text-left border-separate border-spacing-y-2 text-sm w-full">
        <thead>
          <tr className="text-(--text-secondary)">
            <th className="pr-4">Titre</th>
            <th className="pr-4">Employeur</th>
            <th className="pr-4">Type</th>
            <th className="pr-4">Date</th>
            <th className="pr-4">Ville</th>
            <th className="pr-4">Statut</th>
            <th className="pr-4">Freelance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {missions.map(m => (
            <tr key={m.id} className="border-b border-(--line-soft)">
              <td className="pr-4 py-1.5">{m.title}</td>
              <td className="pr-4">{m.company_name}</td>
              <td className="pr-4">{m.mission_type}</td>
              <td className="pr-4">{new Date(m.date).toLocaleDateString('fr-FR')}</td>
              <td className="pr-4">{m.city}</td>
              <td className="pr-4">{statusLabels[m.status] ?? m.status}</td>
              <td className="pr-4">{m.freelance_first_name ? `${m.freelance_first_name} ${m.freelance_last_name}` : '—'}</td>
              <td className="flex gap-1 py-1.5">
                {m.status !== 'cancelled' && (
                  <button onClick={() => handleStatus(m.id, 'cancelled')} className="rounded border border-(--line-soft) px-2 py-0.5 text-xs hover:bg-red-50">Annuler</button>
                )}
                {m.status === 'cancelled' && (
                  <button onClick={() => handleStatus(m.id, 'open')} className="rounded border border-(--line-soft) px-2 py-0.5 text-xs hover:bg-green-50">Rouvrir</button>
                )}
                <button onClick={() => handleDelete(m.id)} className="rounded border border-red-300 px-2 py-0.5 text-xs text-red-600 hover:bg-red-50">Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {missions.length === 0 && <p className="text-(--text-secondary)">Aucune mission.</p>}
    </main>
  )
}
