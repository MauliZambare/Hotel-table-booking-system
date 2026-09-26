import { Navigate, useLocation } from 'react-router-dom'
import { getStoredUser } from '../services/auth.js'

function ProtectedRoute({ children, requireAdmin = false }) {
  const location = useLocation()
  const user = getStoredUser()

  if (!user) {
    if (requireAdmin) {
      return <Navigate to="/admin/login" replace state={{ from: location }} />
    }

    return (
      <Navigate
        to="/login"
        replace
        state={{
          message: location.pathname === '/my-bookings'
            ? 'Please login to view your bookings.'
            : 'Please login to continue.',
          from: location,
        }}
      />
    )
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute