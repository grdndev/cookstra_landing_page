import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext";
import { getDashboard } from "../api/api";

type Mission = {
  id: string;
  title: string;
  status: string;
  date: Date;
  hourly_rate: number;
  start_time: string;
  end_time: string;
  applications: number;
}

export default function DashboardPage() {
  const { token } = useAuth()
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)

  async function loadMissions() {
    try {
      const response = await getDashboard(token!)
      if (response.ok) {
        const data = await response.json()
        setMissions(data.data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMissions()
  }, [])

  if (loading) {
    return <div className="animate-pulse">Chargement...</div>
  }

  const completedMissions = missions.filter(m => m.status === 'completed')
  const earnings = completedMissions.reduce((total, mission) => {
    const time = new Date(`1970-01-01T${mission.end_time}:00Z`).getTime() - new Date(`1970-01-01T${mission.start_time}:00Z`).getTime()
    const hours = time / (1000 * 60 * 60)
    return total + hours * mission.hourly_rate
  }, 0)
  const favorites = missions.sort((a, b) => b.applications - a.applications).slice(0, 3)

  return (
    <main>
      <div>
        <h2>Statistiques de la plateforme</h2>
      </div>

      <section className="mt-4.5 grid grid-cols-3 gap-3 max-[900px]:grid-cols-1" aria-label="Core metrics">
        <article className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4 [background:linear-gradient(145deg,rgba(221,143,34,0.14),transparent_65%),var(--bg-panel-muted)]">
          <p className="font-bold text-(--text-secondary)">Missions postées</p>
          <p className="mt-2 text-[clamp(1.5rem,3vw,2.1rem)] font-bold font-['Space_Grotesk',sans-serif]">{missions.length}</p>
        </article>

        <article className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4 [background:linear-gradient(145deg,rgba(221,143,34,0.14),transparent_65%),var(--bg-panel-muted)]">
          <p className="font-bold text-(--text-secondary)">Missions terminées</p>
          <p className="mt-2 text-[clamp(1.5rem,3vw,2.1rem)] font-bold font-['Space_Grotesk',sans-serif]">{completedMissions.length}</p>
        </article>

        <article className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4 [background:linear-gradient(145deg,rgba(221,143,34,0.14),transparent_65%),var(--bg-panel-muted)]">
          <p className="font-bold text-(--text-secondary)">Chiffre d'affaire</p>
          <p className="mt-2 text-[clamp(1.5rem,3vw,2.1rem)] font-bold font-['Space_Grotesk',sans-serif]">{earnings.toFixed(2)} €</p>
        </article>
      </section>

      <div className="mt-10">
        <h2>Missions les plus demandées</h2>
      </div>

      <section className="mt-4.5 grid grid-cols-3 gap-3 max-[900px]:grid-cols-1" aria-label="Top missions">
        {favorites.map(mission => (
          <article key={mission.id} className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4 [background:linear-gradient(145deg,rgba(221,143,34,0.14),transparent_65%),var(--bg-panel-muted)]">
            <p className="font-bold">{mission.title}</p>
            <p className="mt-2 text-sm text-(--text-secondary)">Statut : {mission.status}</p>
            <p className="mt-2 text-sm text-(--text-secondary)">Nombre de candidatures : {mission.applications}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
