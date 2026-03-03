import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedAdminRouteProps {
  children: React.ReactNode
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { user, loading, canAccessDashboard } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!canAccessDashboard) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="rounded-2xl border border-white/10 bg-[#111] p-6 sm:p-8 max-w-md w-full text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Access denied</h1>
          <p className="text-sm text-gray-400 mb-6">
            You do not have the required permissions to access this page.
            This page is reserved for administrators.
          </p>
          <a
            href="/"
            className="inline-block px-5 py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-colors text-sm"
          >
            Back to home
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedAdminRoute

