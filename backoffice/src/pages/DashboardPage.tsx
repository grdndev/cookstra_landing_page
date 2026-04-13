import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext";
import { getDashboard } from "../api/api";

type DashboardData = {
  missions: { total: number; open: number; completed: number; in_progress: number }
  users: { total: number; freelances: number; employers: number }
  revenue: { total: number; commission: number }
  topMissions: { label: string; count: number }[]
}

export default function DashboardPage() {
  const { token } = useAuth()
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
        <h2>Statistiques de la plateforme</h2>
      </div>

      <section className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-1">
        <article className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4">
          <p className="font-bold text-(--text-secondary)">Missions postées</p>
          <p className="mt-2 text-[clamp(1.5rem,3vw,2.1rem)] font-bold">{data.missions.total}</p>
          <p className="mt-1 text-sm text-(--text-secondary)">{data.missions.open} ouvertes · {data.missions.in_progress} en cours</p>
        </article>
        <article className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4">
          <p className="font-bold text-(--text-secondary)">Missions terminées</p>
          <p className="mt-2 text-[clamp(1.5rem,3vw,2.1rem)] font-bold">{data.missions.completed}</p>
        </article>
        <article className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4">
          <p className="font-bold text-(--text-secondary)">Chiffre d'affaire</p>
          <p className="mt-2 text-[clamp(1.5rem,3vw,2.1rem)] font-bold">{data.revenue.total.toFixed(2)} €</p>
          <p className="mt-1 text-sm text-(--text-secondary)">Commission : {data.revenue.commission.toFixed(2)} €</p>
        </article>
      </section>

      <section className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-1">
        <article className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4">
          <p className="font-bold text-(--text-secondary)">Utilisateurs</p>
          <p className="mt-2 text-[clamp(1.5rem,3vw,2.1rem)] font-bold">{data.users.total}</p>
          <p className="mt-1 text-sm text-(--text-secondary)">{data.users.freelances} freelances · {data.users.employers} employeurs</p>
        </article>
      </section>

      {data.topMissions.length > 0 && (
        <>
          <div><h2>Types de missions les plus demandés</h2></div>
          <section className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-1">
            {data.topMissions.map(m => (
              <article key={m.label} className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4">
                <p className="font-bold">{m.label}</p>
                <p className="mt-2 text-2xl font-bold">{m.count}</p>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  )
}
