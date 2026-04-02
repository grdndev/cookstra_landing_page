import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <div className="rounded-md border border-(--line-soft) bg-(--bg-panel) px-5.5 py-4.5 font-semibold text-(--text-secondary) shadow-(--shadow-soft)">
          Chargement...
        </div>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
