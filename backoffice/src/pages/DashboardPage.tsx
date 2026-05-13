import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext";
import { getDashboard } from "../api/api";
import { useNavigate } from "react-router-dom";

type RecentUser = {
  id: string
  email: string
  role: string
  created_at: string
  first_name?: string
  last_name?: string
  company_name?: string
}

type DashboardData = {
  missions: { total: number; open: number; completed: number; in_progress: number; cancelled: number }
  users: { total: number; freelances: number; employers: number; hr: number; new_last_30d: number }
  revenue: { total: number; commission: number; invoice_count: number }
  applications: { total: number; pending: number; accepted: number; rejected: number }
  documents: { total: number; pending_review: number }
  topMissions: { label: string; count: number }[]
  recentUsers: RecentUser[]
}

const roleLabels: Record<string, string> = {
  freelance: 'Freelance',
  employer: 'Employeur',
  hr: 'RH',
}

export default function DashboardPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard(token!).then(r => r.json()).then(d => {
      if (d.success) setData(d.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="animate-pulse">Chargement...</div>
  if (!data) return <div>Erreur de chargement</div>

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h2>Vue d'ensemble</h2>
      </div>

      {/* Missions */}
      <section>
        <h3 className="text-sm font-semibold text-(--text-secondary) uppercase tracking-wide mb-3">Missions</h3>
        <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[500px]:grid-cols-1">
          <StatCard label="Total postées" value={data.missions.total} />
          <StatCard label="Ouvertes" value={data.missions.open} accent />
          <StatCard label="En cours" value={data.missions.in_progress} />
          <StatCard label="Terminées" value={data.missions.completed} />
        </div>
      </section>

      {/* Utilisateurs */}
      <section>
        <h3 className="text-sm font-semibold text-(--text-secondary) uppercase tracking-wide mb-3">Utilisateurs</h3>
        <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[500px]:grid-cols-1">
          <StatCard label="Total" value={data.users.total} />
          <StatCard label="Freelances" value={data.users.freelances} />
          <StatCard label="Employeurs" value={data.users.employers} />
          <StatCard label="Nouveaux (30j)" value={data.users.new_last_30d} accent />
        </div>
      </section>

      {/* Candidatures & Documents */}
      <section>
        <h3 className="text-sm font-semibold text-(--text-secondary) uppercase tracking-wide mb-3">Activité</h3>
        <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[500px]:grid-cols-1">
          <StatCard label="Candidatures" value={data.applications.total} />
          <StatCard label="Candidatures en attente" value={data.applications.pending} accent={data.applications.pending > 0} />
          <StatCard label="Documents soumis" value={data.documents.total} />
          <StatCard
            label="Documents à vérifier"
            value={data.documents.pending_review}
            accent={data.documents.pending_review > 0}
            onClick={() => navigate('/documents')}
          />
        </div>
      </section>

      {/* Revenus */}
      <section>
        <h3 className="text-sm font-semibold text-(--text-secondary) uppercase tracking-wide mb-3">Revenus</h3>
        <div className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-1">
          <article className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4">
            <p className="text-sm text-(--text-secondary)">Chiffre d'affaires TTC</p>
            <p className="mt-2 text-[clamp(1.5rem,3vw,2rem)] font-bold">{data.revenue.total.toFixed(2)} €</p>
          </article>
          <article className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4">
            <p className="text-sm text-(--text-secondary)">Commission HT</p>
            <p className="mt-2 text-[clamp(1.5rem,3vw,2rem)] font-bold">{data.revenue.commission.toFixed(2)} €</p>
          </article>
          <article className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4">
            <p className="text-sm text-(--text-secondary)">Factures payées</p>
            <p className="mt-2 text-[clamp(1.5rem,3vw,2rem)] font-bold">{data.revenue.invoice_count}</p>
          </article>
        </div>
      </section>

      {/* Top missions */}
      {data.topMissions.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-(--text-secondary) uppercase tracking-wide mb-3">Types de missions les plus demandés</h3>
          <div className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-1">
            {data.topMissions.map(m => (
              <article key={m.label} className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4 flex items-center justify-between">
                <p className="font-medium">{m.label}</p>
                <p className="text-2xl font-bold">{m.count}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Derniers inscrits */}
      {data.recentUsers.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-(--text-secondary) uppercase tracking-wide mb-3">Derniers inscrits</h3>
          <div className="rounded-lg border border-(--line-soft) overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-(--bg-panel-muted) text-(--text-secondary)">
                  <th className="text-left px-4 py-2">Nom / Entreprise</th>
                  <th className="text-left px-4 py-2">Email</th>
                  <th className="text-left px-4 py-2">Rôle</th>
                  <th className="text-left px-4 py-2">Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.map(u => (
                  <tr
                    key={u.id}
                    className="border-t border-(--line-soft) hover:bg-(--bg-panel-muted) cursor-pointer transition-colors"
                    onClick={() => navigate(`/users/${u.id}`)}
                  >
                    <td className="px-4 py-2 font-medium">
                      {u.role === 'freelance'
                        ? `${u.first_name || ''} ${u.last_name || ''}`.trim() || '—'
                        : u.company_name || '—'}
                    </td>
                    <td className="px-4 py-2 text-(--text-secondary)">{u.email}</td>
                    <td className="px-4 py-2">
                      <span className="rounded-full bg-(--bg-panel) border border-(--line-soft) px-2 py-0.5 text-xs">
                        {roleLabels[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-(--text-secondary)">
                      {new Date(u.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  )
}

function StatCard({ label, value, accent, onClick }: { label: string; value: number; accent?: boolean; onClick?: () => void }) {
  return (
    <article
      onClick={onClick}
      className={`rounded-lg border p-4 flex flex-col gap-1 ${accent ? 'border-(--accent) bg-(--accent)/5' : 'border-(--line-soft) bg-(--bg-panel-muted)'} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
    >
      <p className="text-sm text-(--text-secondary)">{label}</p>
      <p className="text-[clamp(1.4rem,3vw,1.9rem)] font-bold">{value}</p>
    </article>
  )
}
