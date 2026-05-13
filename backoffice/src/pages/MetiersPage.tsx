import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext"
import { deleteMissionType, getMissionTypes, patchMissionType, postMissionType } from "../api/api"

type MissionType = { id: string; name: string; dress_code: string | null; category: string | null; created_at: string }

const CATEGORIES = ['En salle', 'En cuisine', 'Événementiel / Traiteur']

export default function MetiersPage() {
  const { token } = useAuth()
  const [types, setTypes] = useState<MissionType[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  // Edit modal state
  const [editTarget, setEditTarget] = useState<MissionType | null>(null)
  const [editName, setEditName] = useState('')
  const [editDressCode, setEditDressCode] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editSaving, setEditSaving] = useState(false)

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

  function openEdit(t: MissionType) {
    setEditTarget(t)
    setEditName(t.name)
    setEditDressCode(t.dress_code || '')
    setEditCategory(t.category || '')
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget || !editName.trim()) return
    setEditSaving(true)
    await patchMissionType(token!, editTarget.id, editName.trim(), editDressCode.trim(), editCategory.trim())
    setEditSaving(false)
    setEditTarget(null)
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

      <table className="text-left border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr className="text-(--text-secondary)">
            <th className="pr-6">Métier</th>
            <th className="pr-4">Catégorie</th>
            <th className="pr-6">Tenue professionnelle</th>
            <th className="pr-4">Créé le</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {types.map(t => (
            <tr key={t.id} className="align-top">
              <td className="pr-6 py-1 font-medium">{t.name}</td>
              <td className="pr-4 py-1">
                {t.category
                  ? <span className="rounded-full bg-(--accent)/10 px-2 py-0.5 text-xs text-(--accent) font-medium">{t.category}</span>
                  : <span className="text-xs italic text-(--text-secondary) opacity-60">—</span>
                }
              </td>
              <td className="pr-6 py-1 text-(--text-secondary) max-w-sm">
                {t.dress_code
                  ? <span className="text-xs">{t.dress_code}</span>
                  : <span className="text-xs italic text-(--text-secondary) opacity-60">Non définie</span>
                }
              </td>
              <td className="pr-4 py-1 whitespace-nowrap">{new Date(t.created_at).toLocaleDateString('fr-FR')}</td>
              <td className="py-1">
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(t)}
                    className="rounded border border-(--accent) px-2 py-0.5 text-xs text-(--accent) hover:bg-(--accent) hover:text-white transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(t.id, t.name)}
                    className="rounded border border-red-300 px-2 py-0.5 text-xs text-red-600 hover:bg-red-50"
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {types.length === 0 && <p className="text-(--text-secondary)">Aucun métier.</p>}

      {/* Edit modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Modifier « {editTarget.name} »</h3>
            <form onSubmit={handleEdit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom du métier</label>
                <input
                  className="w-full min-h-10 rounded-lg border border-(--line-soft) px-3 text-sm focus:border-(--accent) focus:outline-none"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catégorie</label>
                <select
                  className="w-full min-h-10 rounded-lg border border-(--line-soft) px-3 text-sm focus:border-(--accent) focus:outline-none"
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                >
                  <option value="">— Choisir une catégorie —</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tenue professionnelle</label>
                <textarea
                  className="w-full rounded-lg border border-(--line-soft) px-3 py-2 text-sm focus:border-(--accent) focus:outline-none resize-none"
                  rows={3}
                  placeholder="Ex: Veste de cuisine blanche, pantalon noir, chaussures de sécurité..."
                  value={editDressCode}
                  onChange={e => setEditDressCode(e.target.value)}
                />
                <p className="text-xs text-(--text-secondary) mt-1">
                  Ce texte sera automatiquement inclus dans le contrat pour ce métier.
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="min-h-9 rounded-lg border border-(--line-soft) px-4 text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="min-h-9 rounded-lg bg-(--accent) px-4 text-sm font-bold text-white disabled:opacity-60"
                >
                  {editSaving ? 'Sauvegarde...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
