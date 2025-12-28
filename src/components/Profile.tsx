import { useNavigate } from 'react-router-dom'
import Header from './Header'
import { useAuth } from '../contexts/AuthContext'

const Profile = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-[#181818] rounded-lg p-8 border border-gray-800">
          <h1 className="text-3xl font-bold text-white mb-6">Mon Profil</h1>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Email</label>
              <div className="p-3 bg-[#0F0F0F] rounded-md text-white border border-gray-700">
                {user?.email}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">ID Utilisateur</label>
              <div className="p-3 bg-[#0F0F0F] rounded-md text-white border border-gray-700 text-sm font-mono break-all">
                {user?.id}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Date de création</label>
              <div className="p-3 bg-[#0F0F0F] rounded-md text-white border border-gray-700">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full mt-8 p-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-semibold"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile


