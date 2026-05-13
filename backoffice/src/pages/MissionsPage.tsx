import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext"
import { deleteMission, getMissions, patchMission } from "../api/api"

type Mission = {
  id: string
  title: string
  date: string
  end_date: string | null
  city: string
  status: string
  hourly_rate: number
  worked_hours: number | null
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

const statusColors: Record<string, string> = {
  open: 'text-green-700 bg-green-50 border-green-200',
  filled: 'text-blue-700 bg-blue-50 border-blue-200',
  in_progress: 'text-orange-700 bg-orange-50 border-orange-200',
  completed: 'text-gray-700 bg-gray-100 border-gray-200',
  cancelled: 'text-red-600 bg-red-50 border-red-200',
}

const ALL_STATUSES = ['', 'open', 'filled', 'in_progress', 'completed', 'cancelled']

export default function MissionsPage() {
  const { token } = useAuth()
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  async function load(status = statusFilter, q = search) {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (q) params.set('search', q)
    const query = params.toString() ? `?${params}` : ''
    const r = await getMissions(token!, query)
    const d = await r.json()
    if (d.success) { setMissions(d.data); setTotal(d.total) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function handleStatusFilter(s: string) {
    setStatusFilter(s)
    load(s, search)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
    load(statusFilter, searchInput)
  }

  async function handleStatus(id: string, status: string) {
    await patchMission(token!, id, status)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette mission définitivement ?')) return
    await deleteMission(token!, id)
    load()
  }

  return (
    <main className="flex flex-col gap-4">
      <h2>Missions <span className="text-base font-normal text-(--text-secondary)">({total})</span></h2>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 flex-wrap">
          {ALL_STATUSES.map(s => (
            <button
              key={s || 'all'}
              onClick={() => handleStatusFilter(s)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-(--accent) border-(--accent) text-white'
                  : 'border-(--line-soft) text-(--text-secondary) hover:bg-(--bg-panel)'
              }`}
            >
              {s ? statusLabels[s] : 'Toutes'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Rechercher..."
            className="rounded-md border border-(--line-soft) bg-(--bg-panel) px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--accent)"
          />
          <button type="submit" className="rounded-md border border-(--line-soft) px-3 py-1.5 text-sm hover:bg-(--bg-panel)">
            Chercher
          </button>
        </form>
      </div>

      {loading ? (
        <div className="animate-pulse">Chargement...</div>
      ) : (
        <>
          <table className="text-left border-separate border-spacing-y-1 text-sm w-full">
            <thead>
              <tr className="text-(--text-secondary)">
                <th className="pr-4 pb-2">Titre</th>
                <th className="pr-4 pb-2">Employeur</th>
                <th className="pr-4 pb-2">Type</th>
                <th className="pr-4 pb-2">Début</th>
                <th className="pr-4 pb-2">Fin</th>
                <th className="pr-4 pb-2">Ville</th>
                <th className="pr-4 pb-2">Nb Heures</th>
                <th className="pr-4 pb-2">Taux horaire</th>
                <th className="pr-4 pb-2">Statut</th>
                <th className="pr-4 pb-2">Freelance</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {missions.map(m => (
                <tr key={m.id} className="border-b border-(--line-soft)">
                  <td className="pr-4 py-1.5 font-medium">{m.title}</td>
                  <td className="pr-4">{m.company_name}</td>
                  <td className="pr-4">{m.mission_type}</td>
                  <td className="pr-4 whitespace-nowrap">{new Date(m.date).toLocaleDateString('fr-FR')}</td>
                  <td className="pr-4 whitespace-nowrap">{m.end_date ? new Date(m.end_date).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="pr-4">{m.city}</td>
                  <td className="pr-4">{m.worked_hours != null ? `${m.worked_hours} h` : '—'}</td>
                  <td className="pr-4">{m.hourly_rate != null ? `${m.hourly_rate} €/h` : '—'}</td>
                  <td className="pr-4">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[m.status] ?? 'border-(--line-soft) text-(--text-secondary)'}`}>
                      {statusLabels[m.status] ?? m.status}
                    </span>
                  </td>
                  <td className="pr-4">{m.freelance_first_name ? `${m.freelance_first_name} ${m.freelance_last_name}` : '—'}</td>
                  <td className="flex gap-1 py-1.5">
                    {m.status !== 'cancelled' && (
                      <button onClick={() => handleStatus(m.id, 'cancelled')} className="rounded border border-red-200 px-2 py-0.5 text-xs text-red-600 hover:bg-red-50">Annuler</button>
                    )}
                    {m.status === 'cancelled' && (
                      <button onClick={() => handleStatus(m.id, 'open')} className="rounded border border-green-200 px-2 py-0.5 text-xs text-green-700 hover:bg-green-50">Rouvrir</button>
                    )}
                    <button onClick={() => handleDelete(m.id)} className="rounded border border-red-300 px-2 py-0.5 text-xs text-red-600 hover:bg-red-50">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {missions.length === 0 && <p className="text-(--text-secondary)">Aucune mission.</p>}
        </>
      )}
    </main>
  )
}
