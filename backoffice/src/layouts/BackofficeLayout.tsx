import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function BackofficeLayout() {
  const { logout } = useAuth()

  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] max-[900px]:grid-cols-1">
      <aside className="grid grid-rows-[auto_1fr] gap-6.5 bg-[linear-gradient(180deg,#112b2a,#153736_55%,#194241)] p-[28px_18px] text-[#f8f8f4] max-[900px]:grid-rows-[auto]">
        <div>
          <p className="mb-2.5 text-[0.74rem] font-bold uppercase tracking-[0.09em] text-(--accent)">Cookstra</p>
          <h1 className="text-[1.45rem]">Backoffice</h1>
        </div>

        <nav className="grid content-start gap-2.5" aria-label="Main menu">
          <NavLink
            className="grid min-h-11.5 place-items-center rounded-xl bg-(--accent) font-bold text-[#fdfdfc] no-underline transition-[transform,background-color] duration-150 hover:-translate-y-px hover:bg-(--accent-strong)"
            to="/"
          >
            Accueil
          </NavLink>
          <NavLink
            className="grid min-h-11.5 place-items-center rounded-xl bg-(--accent) font-bold text-[#fdfdfc] no-underline transition-[transform,background-color] duration-150 hover:-translate-y-px hover:bg-(--accent-strong)"
            to="/users"
          >
            Utilisateurs
          </NavLink>
          <NavLink
            className="grid min-h-11.5 place-items-center rounded-xl bg-(--accent) font-bold text-[#fdfdfc] no-underline transition-[transform,background-color] duration-150 hover:-translate-y-px hover:bg-(--accent-strong)"
            to="/missions"
          >
            Missions
          </NavLink>
          <NavLink
            className="grid min-h-11.5 place-items-center rounded-xl bg-(--accent) font-bold text-[#fdfdfc] no-underline transition-[transform,background-color] duration-150 hover:-translate-y-px hover:bg-(--accent-strong)"
            to="/documents"
          >
            Documents
          </NavLink>
          <NavLink
            className="grid min-h-11.5 place-items-center rounded-xl bg-(--accent) font-bold text-[#fdfdfc] no-underline transition-[transform,background-color] duration-150 hover:-translate-y-px hover:bg-(--accent-strong)"
            to="/payouts"
          >
            Paiement
          </NavLink>
          <NavLink
            className="grid min-h-11.5 place-items-center rounded-xl bg-(--accent) font-bold text-[#fdfdfc] no-underline transition-[transform,background-color] duration-150 hover:-translate-y-px hover:bg-(--accent-strong)"
            to="/parameters"
          >
            Paramètres
          </NavLink>
          <button
            className="mt-2 grid min-h-11.5 place-items-center rounded-xl bg-[rgba(255,255,255,0.08)] font-bold text-[#fdfdfc] transition-transform duration-150 hover:-translate-y-px"
            type="button"
            onClick={logout}
          >
            Log out
          </button>
        </nav>
      </aside>

      <section className="p-4.5">
        <div className="rounded-lg border border-(--line-soft) bg-(--bg-panel) p-[clamp(18px,3vw,26px)]">
          <Outlet />
        </div>
      </section>
    </div>
  )
}
