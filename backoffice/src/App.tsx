import { BackofficeLayout } from './layouts/BackofficeLayout'
import { LoginPage } from './pages/LoginPage'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './routes/ProtectedRoute'
import DashboardPage from './pages/DashboardPage'
import DocumentsPage from './pages/DocumentsPage'
import MissionsPage from './pages/MissionsPage'
import UsersPage from './pages/UsersPage'
import PayoutsPage from './pages/PayoutsPage'
import ParametersPage from './pages/ParametersPage'
import UserDetailPage from './pages/UserDetailPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<BackofficeLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:userId" element={<UserDetailPage />} />
          <Route path="/missions" element={<MissionsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/payouts" element={<PayoutsPage />} />
          <Route path="/parameters" element={<ParametersPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
