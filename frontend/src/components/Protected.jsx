import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldIcon, AlertIcon } from '../icons'

export default function Protected({ children, adminOnly = false }) {
  const { token, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="loading">
        <span className="spinner" /> Loading
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && user?.role !== 'admin') {
    return (
      <div className="empty">
        <div className="empty-icon">
          <ShieldIcon size={44} />
        </div>
        <h3>Admins only</h3>
        <p>This area requires an administrator account.</p>
      </div>
    )
  }

  return children
}