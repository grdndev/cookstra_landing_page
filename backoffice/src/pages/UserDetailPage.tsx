import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext"
import { getUser, postUser, validateUser } from "../api/api"
import { useParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type User = {
  id: string
  email: string
  role: string
  is_verified: number
  profile_completed: number
  created_at: string
  first_name?: string
  last_name?: string
  phone?: string
  city?: string
  address?: string
  civility?: string
  freelance_siret?: string
  freelance_rating?: number
  freelance_missions?: number
  identity_document?: string
  freelance_kbis?: string
  freelance_rib?: string
  company_name?: string
  contact_name?: string
  employer_phone?: string
  employer_city?: string
  employer_siret?: string
  employer_address?: string
  employer_rating?: number
  kbis_document?: string
  rib?: string
  photos?: string
  logo_url?: string
  validation_status?: 'pending' | 'approved' | 'rejected'
}

const roleLabels: Record<string, string> = {
  freelance: 'Freelance',
  employer: 'Employeur',
  admin: 'Administrateur',
  hr: 'Ressources humaines',
}

export default function UserDetailPage() {
  const { userId } = useParams()
  const { token, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [validating, setValidating] = useState(false)

  // Champs communs
  const [email, setEmail] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [profileCompleted, setProfileCompleted] = useState(false)

  // Champs freelance
  const [civility, setCivility] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [siret, setSiret] = useState('')
  const [address, setAddress] = useState('')

  // Champs employer
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [employerPhone, setEmployerPhone] = useState('')
  const [employerCity, setEmployerCity] = useState('')
  const [employerSiret, setEmployerSiret] = useState('')
  const [employerAddress, setEmployerAddress] = useState('')

  async function loadUser() {
    try {
      const response = await getUser(token!, userId!)
      if (response.ok) {
        const data = await response.json()
        const u: User = data.data
        setUser(u)
        setEmail(u.email || '')
        setIsVerified(!!u.is_verified)
        setProfileCompleted(!!u.profile_completed)
        setCivility(u.civility || '')
        setFirstName(u.first_name || '')
        setLastName(u.last_name || '')
        setPhone(u.phone || '')
        setCity(u.city || '')
        setSiret(u.freelance_siret || '')
        setAddress(u.address || '')
        setCompanyName(u.company_name || '')
        setContactName(u.contact_name || '')
        setEmployerPhone(u.employer_phone || '')
        setEmployerCity(u.employer_city || '')
        setEmployerSiret(u.employer_siret || '')
        setEmployerAddress(u.employer_address || '')
      } else {
        const data = await response.json().catch(() => ({}))
        setError(`Erreur ${response.status}: ${data.message || 'inconnue'}`)
      }
    } catch (e) {
      setError(`Erreur réseau: ${e}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError('')

    if (!siret) {
      setError('Le champ SIRET est obligatoire pour les freelances.')
      setSaving(false)
      return
    }

    try {
      const payload: Record<string, unknown> = {
        email,
        is_verified: isVerified ? 1 : 0,
        profile_completed: profileCompleted ? 1 : 0,
      }
      if (user?.role === 'freelance') {
        payload.civility = civility
        payload.first_name = firstName
        payload.last_name = lastName
        payload.phone = phone
        payload.city = city
        payload.siret = siret
        payload.address = address
      } else if (user?.role === 'employer') {
        payload.company_name = companyName
        payload.contact_name = contactName
        payload.employer_phone = employerPhone
        payload.employer_city = employerCity
        payload.employer_siret = employerSiret
        payload.employer_address = employerAddress
      }
      const res = await postUser(token!, userId!, payload)
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        loadUser()
      } else {
        setError('Erreur lors de la sauvegarde')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleValidate(status: 'approved' | 'rejected') {
    setValidating(true)
    setError('')
    try {
      const res = await validateUser(token!, userId!, status)
      if (res.ok) {
        loadUser()
      } else {
        setError('Erreur lors de la validation')
      }
    } finally {
      setValidating(false)
    }
  }

  useEffect(() => {
    if (!authLoading && token) loadUser()
  }, [token, authLoading])

  if (loading || authLoading) return <div className="animate-pulse">Chargement...</div>
  if (!user) return <div className="flex flex-col gap-2 p-4"><div className="font-semibold">Utilisateur introuvable.</div>{error && <div className="text-sm text-red-400">{error}</div>}</div>

  const isFreelance = user.role === 'freelance'
  const isEmployer = user.role === 'employer'

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/users')}
          className="text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors"
        >
          ← Utilisateurs
        </button>
        <span className="text-(--text-secondary)">/</span>
        <h2 className="text-lg font-semibold">
          {isFreelance ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : user.company_name || user.email}
        </h2>
        <span className="rounded-full bg-(--bg-panel-muted) px-2 py-0.5 text-xs font-medium text-(--text-secondary)">
          {roleLabels[user.role] ?? user.role}
        </span>
        <button
          onClick={() => navigate(`/users/${userId}/documents`)}
          className="ml-auto rounded-lg border border-(--line-soft) px-4 py-1.5 text-sm font-medium hover:bg-(--bg-panel-muted) transition-colors"
        >
          Documents
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">

        {/* Infos lecture seule */}
        <div className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4 flex flex-col gap-3">
          <h3 className="font-semibold text-sm text-(--text-secondary) uppercase tracking-wide">Infos</h3>
          <Row label="Rôle" value={roleLabels[user.role] ?? user.role} />
          <Row label="Inscrit le" value={new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} />
          {isFreelance && (
            <>
              <Row label="Note" value={user.freelance_rating != null ? `${user.freelance_rating}/5` : undefined} />
              <Row label="Missions réalisées" value={user.freelance_missions?.toString()} />
            </>
          )}
          {isEmployer && (
            <Row label="Note" value={user.employer_rating != null ? `${user.employer_rating}/5` : undefined} />
          )}
        </div>

        {/* Validation du compte */}
        {(isFreelance || isEmployer) && (
          <div className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4 flex flex-col gap-4">
            <h3 className="font-semibold text-sm text-(--text-secondary) uppercase tracking-wide">Validation du compte</h3>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                user.validation_status === 'approved' ? 'bg-green-500/15 text-green-400' :
                user.validation_status === 'rejected' ? 'bg-red-500/15 text-red-400' :
                'bg-yellow-500/15 text-yellow-400'
              }`}>
                <span className={`h-2 w-2 rounded-full ${
                  user.validation_status === 'approved' ? 'bg-green-400' :
                  user.validation_status === 'rejected' ? 'bg-red-400' :
                  'bg-yellow-400'
                }`} />
                {user.validation_status === 'approved' ? 'Approuvé' :
                 user.validation_status === 'rejected' ? 'Refusé' : 'En attente'}
              </span>
            </div>
            {user.validation_status !== 'approved' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleValidate('approved')}
                  disabled={validating}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
                >
                  {validating ? '…' : 'Approuver'}
                </button>
                {user.validation_status !== 'rejected' && (
                  <button
                    onClick={() => handleValidate('rejected')}
                    disabled={validating}
                    className="rounded-lg bg-red-600/80 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
                  >
                    Refuser
                  </button>
                )}
              </div>
            )}
            {user.validation_status === 'approved' && (
              <button
                onClick={() => handleValidate('rejected')}
                disabled={validating}
                className="self-start rounded-lg border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
              >
                Révoquer l'accès
              </button>
            )}
          </div>
        )}

        {/* Champs éditables communs */}
        <div className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4 flex flex-col gap-4">
          <h3 className="font-semibold text-sm text-(--text-secondary) uppercase tracking-wide">Compte</h3>

          <Field label="Email">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
          </Field>

          <label className="flex items-center justify-between">
            <span className="text-sm font-medium">Email vérifié</span>
            <Toggle checked={isVerified} onChange={setIsVerified} />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm font-medium">Profil complété</span>
            <Toggle checked={profileCompleted} onChange={setProfileCompleted} />
          </label>
        </div>

        {/* Champs profil freelance */}
        {isFreelance && (
          <div className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4 flex flex-col gap-4 col-span-2 max-[700px]:col-span-1">
            <h3 className="font-semibold text-sm text-(--text-secondary) uppercase tracking-wide">Profil freelance</h3>
            <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
              <Field label="Civilité">
                <select value={civility} onChange={e => setCivility(e.target.value)} className={inputClass}>
                  <option value="">—</option>
                  <option value="M.">M.</option>
                  <option value="Mme">Mme</option>
                </select>
              </Field>
              <Field label="Prénom">
                <input value={firstName} onChange={e => setFirstName(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Nom">
                <input value={lastName} onChange={e => setLastName(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Téléphone">
                <input value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Ville">
                <input value={city} onChange={e => setCity(e.target.value)} className={inputClass} />
              </Field>
              <Field label="SIRET *">
                <input value={siret} onChange={e => setSiret(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Adresse postale">
                <input value={address} onChange={e => setAddress(e.target.value)} className={inputClass} />
              </Field>
            </div>
          </div>
        )}

        {/* Champs profil employer */}
        {isEmployer && (
          <div className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4 flex flex-col gap-4 col-span-2 max-[700px]:col-span-1">
            <h3 className="font-semibold text-sm text-(--text-secondary) uppercase tracking-wide">Profil employeur</h3>
            <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
              <Field label="Nom de l'entreprise">
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Contact">
                <input value={contactName} onChange={e => setContactName(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Téléphone">
                <input value={employerPhone} onChange={e => setEmployerPhone(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Ville">
                <input value={employerCity} onChange={e => setEmployerCity(e.target.value)} className={inputClass} />
              </Field>
              <Field label="SIRET">
                <input value={employerSiret} onChange={e => setEmployerSiret(e.target.value)} className={inputClass} />
              </Field>
            </div>
          </div>
        )}
      </div>

      {/* Documents */}
      {(isFreelance || isEmployer) && (
        <div className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4 flex flex-col gap-4">
          <h3 className="font-semibold text-sm text-(--text-secondary) uppercase tracking-wide">Documents</h3>
          <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
            {isFreelance && (
              <>
                <DocLink label="Pièce d'identité" url={user.identity_document} />
                <DocLink label="Kbis" url={user.freelance_kbis} />
                <DocLink label="RIB" url={user.freelance_rib} />
              </>
            )}
            {isEmployer && (
              <>
                <DocLink label="Kbis" url={user.kbis_document} />
                <DocLink label="RIB" url={user.rib} />
                {user.logo_url && (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-(--text-secondary)">Logo</span>
                    <img src={`${API_URL}${user.logo_url}`} alt="Logo" className="h-16 w-16 rounded object-cover border border-(--line-soft)" />
                  </div>
                )}
              </>
            )}
          </div>
          {isEmployer && user.photos && (() => {
            let photoList: string[] = []
            try { photoList = JSON.parse(user.photos) } catch { photoList = user.photos.split(',').filter(Boolean) }
            return photoList.length > 0 ? (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-(--text-secondary)">Photos de l'établissement</span>
                <div className="flex flex-wrap gap-2">
                  {photoList.map((p, i) => (
                    <a key={i} href={`${API_URL}${p}`} target="_blank" rel="noreferrer">
                      <img src={`${API_URL}${p}`} alt={`Photo ${i + 1}`} className="h-20 w-20 rounded object-cover border border-(--line-soft) hover:opacity-80 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            ) : null
          })()}
        </div>
      )}

      {/* Bouton sauvegarder */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-(--accent) px-5 py-2 text-sm font-semibold text-white hover:bg-(--accent-strong) disabled:opacity-50 transition-colors"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        {saved && <span className="text-sm text-green-600 font-medium">Sauvegardé ✓</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </main>
  )
}

const inputClass = "rounded-md border border-(--line-soft) bg-(--bg-panel) px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--accent) w-full"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-(--text-secondary)">{label}</span>
      <span className="font-medium text-right">{value || '—'}</span>
    </div>
  )
}

function DocLink({ label, url }: { label: string; url?: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-(--text-secondary)">{label}</span>
      {url ? (
        <a
          href={`${API_URL}${url}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-(--accent) underline hover:text-(--accent-strong) transition-colors truncate"
        >
          Voir le document →
        </a>
      ) : (
        <span className="text-sm text-(--text-secondary)">—</span>
      )}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${checked ? 'bg-(--accent)' : 'bg-(--line-soft)'}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}
