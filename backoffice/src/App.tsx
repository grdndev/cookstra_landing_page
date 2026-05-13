import { BackofficeLayout } from './layouts/BackofficeLayout'
import { LoginPage } from './pages/LoginPage'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './routes/ProtectedRoute'
import DashboardPage from './pages/DashboardPage'
import DocumentsPage from './pages/DocumentsPage'
import MissionsPage from './pages/MissionsPage'
import UsersPage from './pages/UsersPage'
import PayoutsPage from './pages/PayoutsPage'
import UserDetailPage from './pages/UserDetailPage'
import UserDocumentsPage from './pages/UserDocumentsPage'
import MetiersPage from './pages/MetiersPage'
import HRPage from './pages/HRPage'
import CreateUserPage from './pages/CreateUserPage'
import { useAuth } from './auth/AuthContext'

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (user?.role !== 'admin') return <Navigate to="/hr" replace />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<BackofficeLayout />}>
          <Route path="/" element={<AdminRoute><DashboardPage /></AdminRoute>} />
          <Route path="/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
          <Route path="/users/:userId" element={<AdminRoute><UserDetailPage /></AdminRoute>} />
          <Route path="/users/:userId/documents" element={<AdminRoute><UserDocumentsPage /></AdminRoute>} />
          <Route path="/users/new" element={<AdminRoute><CreateUserPage /></AdminRoute>} />
          <Route path="/missions" element={<AdminRoute><MissionsPage /></AdminRoute>} />
          <Route path="/documents" element={<AdminRoute><DocumentsPage /></AdminRoute>} />
          <Route path="/payouts" element={<AdminRoute><PayoutsPage /></AdminRoute>} />
          <Route path="/metiers" element={<AdminRoute><MetiersPage /></AdminRoute>} />
          <Route path="/hr" element={<HRPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
