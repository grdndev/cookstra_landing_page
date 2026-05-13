import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext"
import {
  deleteMissionType, getMissionTypes, patchMissionType, postMissionType,
  getMissionCategories, postMissionCategory, deleteMissionCategory,
} from "../api/api"

type MissionType = { id: string; name: string; dress_code: string | null; category: string | null; created_at: string }
type Category = { id: string; name: string }

export default function MetiersPage() {
  const { token } = useAuth()
  const [types, setTypes] = useState<MissionType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Ajout métier
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [saving, setSaving] = useState(false)

  // Ajout catégorie
  const [newCatName, setNewCatName] = useState('')
  const [savingCat, setSavingCat] = useState(false)

  // Modale édition métier
  const [editTarget, setEditTarget] = useState<MissionType | null>(null)
  const [editName, setEditName] = useState('')
  const [editDressCode, setEditDressCode] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  async function loadAll() {
    const [rTypes, rCats] = await Promise.all([
      getMissionTypes(token!),
      getMissionCategories(token!),
    ])
    const dTypes = await rTypes.json()
    const dCats = await rCats.json()
    if (dTypes.success) setTypes(dTypes.data)
    if (dCats.success) setCategories(dCats.data)
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  async function handleAddType(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    await postMissionType(token!, newName.trim())
    setNewName('')
    setNewCategory('')
    setSaving(false)
    loadAll()
  }

  async function handleAddCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!newCatName.trim()) return
    setSavingCat(true)
    await postMissionCategory(token!, newCatName.trim())
    setNewCatName('')
    setSavingCat(false)
    loadAll()
  }

  async function handleDeleteCategory(id: string, name: string) {
    if (!confirm(`Supprimer la catégorie "${name}" ?`)) return
    await deleteMissionCategory(token!, id)
    loadAll()
  }

  function openEdit(t: MissionType) {
    setEditTarget(t)
    setEditName(t.name)
    setEditDressCode(t.dress_code || '')
    const cat = categories.find(c => c.name === t.category)
    setEditCategory(cat?.id || '')
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editTarget || !editName.trim()) return
    setEditSaving(true)
    await patchMissionType(token!, editTarget.id, editName.trim(), editDressCode.trim(), editCategory.trim())
    setEditSaving(false)
    setEditTarget(null)
    loadAll()
  }

  async function handleDeleteType(id: string, name: string) {
    if (!confirm(`Supprimer le métier "${name}" ?`)) return
    await deleteMissionType(token!, id)
    loadAll()
  }

  if (loading) return <div className="animate-pulse">Chargement...</div>

  return (
    <main className="flex flex-col gap-8">

      {/* Section catégories */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Catégories <span className="text-base font-normal text-(--text-secondary)">({categories.length})</span></h2>

        <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md">
          <input
            className="flex-1 min-h-10 rounded-lg border border-(--line-soft) px-3 text-sm focus:border-(--accent) focus:outline-none"
            placeholder="Nom de la catégorie"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={savingCat}
            className="min-h-10 rounded-lg bg-(--accent) px-4 text-sm font-bold text-white disabled:opacity-60"
          >
            Ajouter
          </button>
        </form>

        {categories.length === 0 ? (
          <p className="text-sm text-(--text-secondary)">Aucune catégorie.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <span key={c.id} className="inline-flex items-center gap-2 rounded-full border border-(--line-soft) bg-(--bg-panel-muted) px-3 py-1 text-sm">
                {c.name}
                <button
                  onClick={() => handleDeleteCategory(c.id, c.name)}
                  className="text-(--text-secondary) hover:text-red-500 transition-colors leading-none"
                  aria-label="Supprimer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      <div className="border-t border-(--line-soft)" />

      {/* Section métiers */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Métiers <span className="text-base font-normal text-(--text-secondary)">({types.length})</span></h2>

        <form onSubmit={handleAddType} className="flex gap-2 max-w-xl flex-wrap">
          <input
            className="flex-1 min-w-40 min-h-10 rounded-lg border border-(--line-soft) px-3 text-sm focus:border-(--accent) focus:outline-none"
            placeholder="Nom du métier (ex: Cuisinier)"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            required
          />
          <select
            className="min-h-10 rounded-lg border border-(--line-soft) px-3 text-sm focus:border-(--accent) focus:outline-none bg-(--bg-panel)"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
          >
            <option value="">— Catégorie —</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
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
                      onClick={() => handleDeleteType(t.id, t.name)}
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

        {types.length === 0 && <p className="text-sm text-(--text-secondary)">Aucun métier.</p>}
      </section>

      {/* Modale édition métier */}
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
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
