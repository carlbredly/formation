import { Link } from 'react-router-dom'
import logo from '../assets/mobutu.png'
import { useAuth } from '../contexts/AuthContext'

const Header = () => {
  const { user, isAdmin } = useAuth()

  return (
    <header className="w-full bg-[#181818] border-b border-gray-800 px-6 py-4">
      <div className="w-full  mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="logo" className="w-10 " />
          <span className="text-xl font-bold text-white">Formation</span>
        </Link>
        
        {user && (
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link 
                to="/dashboard" 
                className="px-3 py-2 rounded-lg bg-[#0F0F0F] hover:bg-[#252525] transition-colors text-sm text-gray-300"
              >
                Dashboard
              </Link>
            )}
            <Link 
              to="/profile" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F0F0F] hover:bg-[#252525] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm text-gray-300">{user.email}</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header


