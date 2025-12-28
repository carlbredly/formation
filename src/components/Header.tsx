import { Link } from 'react-router-dom'
import logo from '../assets/mobutu.png'
import { useAuth } from '../contexts/AuthContext'

const Header = () => {
  const { user, isAdmin } = useAuth()

  return (
    <header className="w-full bg-[#181818] border-b border-gray-800 px-4 sm:px-4 py-2">
      <div className="w-full mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3">
          <img src={logo} alt="logo" className="w-8  sm:w-10 " />
          <span className="text-lg sm:text-xl font-bold text-white">Formation</span>
        </Link>
        
        {user && (
          <div className="flex items-center gap-2 sm:gap-3">
            {isAdmin && (
              <Link 
                to="/dashboard" 
                className="px-2 sm:px-3 py-2 rounded-lg bg-[#0F0F0F] hover:bg-[#252525] transition-colors text-xs sm:text-sm text-gray-300 whitespace-nowrap"
              >
                Dashboard
              </Link>
            )}
            <Link 
              to="/profile" 
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg bg-[#0F0F0F] hover:bg-[#252525] transition-colors"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm shrink-0">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline text-sm text-gray-300">{user.email}</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

