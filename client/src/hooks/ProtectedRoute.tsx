import { Navigate, useLocation } from 'react-router-dom'

// Hooks
import { useAuth } from './useAuth'

// Components
import { LoadingScreen, Spinner } from '../components/ui'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <LoadingScreen>
        <Spinner role="status" aria-label="Loading" />
      </LoadingScreen>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
