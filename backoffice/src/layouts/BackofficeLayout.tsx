import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-4 min-h-11 rounded-xl font-semibold no-underline transition-all duration-150 text-sm
  ${isActive
    ? 'bg-[#FDD835] text-[#1a2010] shadow-sm'
    : 'text-white hover:bg-white/10'
  }`

export function BackofficeLayout() {
  const { logout, user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isHR = user?.role === 'hr'

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] max-[900px]:grid-cols-1">
      <aside className="flex flex-col gap-6 bg-[#558B2F] p-[24px_16px] max-[900px]:flex-row max-[900px]:flex-wrap">
        <div>
          <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-widest text-[#FDD835]">Cookstra</p>
          <h1 className="text-[1.4rem] font-bold text-white leading-tight">Backoffice</h1>
          {isHR && <p className="mt-1 text-xs text-[#FDD835]">Accès RH</p>}
        </div>

        <nav className="flex flex-col gap-1.5 flex-1" aria-label="Main menu">
          {isAdmin && (
            <>
              <NavLink className={navClass} to="/">Accueil</NavLink>
              <NavLink className={navClass} to="/users">Utilisateurs</NavLink>
              <NavLink className={navClass} to="/missions">Missions</NavLink>
              <NavLink className={navClass} to="/documents">Documents</NavLink>
              <NavLink className={navClass} to="/payouts">Paiement</NavLink>
              <NavLink className={navClass} to="/metiers">Métiers</NavLink>
              <NavLink className={navClass} to="/parameters">Paramètres</NavLink>
            </>
          )}
          {isHR && (
            <NavLink className={navClass} to="/hr">Candidatures</NavLink>
          )}
        </nav>

        <button
          className="flex items-center justify-center min-h-10 rounded-xl border border-white/30 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          type="button"
          onClick={logout}
        >
          Déconnexion
        </button>
      </aside>

      <section className="p-5 bg-(--bg-page)">
        <div className="rounded-xl border border-(--line-soft) bg-white p-[clamp(18px,3vw,28px)] min-h-full">
          <Outlet />
        </div>
      </section>
    </div>
  )
}
