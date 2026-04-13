import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext"
import { deleteMissionType, getMissionTypes, postMissionType } from "../api/api"

type MissionType = { id: string; name: string; created_at: string }

export default function MetiersPage() {
  const { token } = useAuth()
  const [types, setTypes] = useState<MissionType[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const r = await getMissionTypes(token!)
    const d = await r.json()
    if (d.success) setTypes(d.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    await postMissionType(token!, newName.trim())
    setNewName('')
    setSaving(false)
    load()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer le métier "${name}" ?`)) return
    await deleteMissionType(token!, id)
    load()
  }

  if (loading) return <div className="animate-pulse">Chargement...</div>

  return (
    <main className="flex flex-col gap-6">
      <h2>Métiers <span className="text-base font-normal text-(--text-secondary)">({types.length})</span></h2>

      <form onSubmit={handleAdd} className="flex gap-2 max-w-md">
        <input
          className="flex-1 min-h-10 rounded-lg border border-(--line-soft) px-3 text-sm focus:border-(--accent) focus:outline-none"
          placeholder="Nom du métier (ex: Cuisinier)"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={saving}
          className="min-h-10 rounded-lg bg-(--accent) px-4 text-sm font-bold text-white disabled:opacity-60"
        >
          Ajouter
        </button>
      </form>

      <table className="text-left border-separate border-spacing-y-2 text-sm max-w-md">
        <thead>
          <tr className="text-(--text-secondary)">
            <th className="pr-4">Nom</th>
            <th className="pr-4">Créé le</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {types.map(t => (
            <tr key={t.id}>
              <td className="pr-4 py-1">{t.name}</td>
              <td className="pr-4">{new Date(t.created_at).toLocaleDateString('fr-FR')}</td>
              <td>
                <button onClick={() => handleDelete(t.id, t.name)} className="rounded border border-red-300 px-2 py-0.5 text-xs text-red-600 hover:bg-red-50">
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {types.length === 0 && <p className="text-(--text-secondary)">Aucun métier.</p>}
    </main>
  )
}
