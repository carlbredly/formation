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
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="rounded-2xl border border-white/10 bg-[#111] p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-6">My Profile</h1>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm break-all">
                {user?.email}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">User ID</label>
              <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono break-all overflow-x-auto">
                {user?.id}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Created at</label>
              <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US') : 'N/A'}
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full mt-6 py-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-300 font-semibold text-sm hover:bg-red-500/30 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile
