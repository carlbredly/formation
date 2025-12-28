import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { checkAdminFromMetadata } from '../lib/admin'

interface ProtectedAdminRouteProps {
  children: React.ReactNode
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Vérifier si l'utilisateur est admin
  const isUserAdmin = checkAdminFromMetadata(user)

  if (!isUserAdmin) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4">
        <div className="bg-[#181818] rounded-lg p-6 sm:p-8 border border-gray-800 max-w-md w-full text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Accès Refusé</h1>
          <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            Cette page est réservée aux administrateurs.
          </p>
          <a
            href="/"
            className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm sm:text-base"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedAdminRoute

