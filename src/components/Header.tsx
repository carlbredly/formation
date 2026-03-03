import { Link } from 'react-router-dom'
import logo from '../assets/mobutu.png'
import { useAuth } from '../contexts/AuthContext'

const Header = () => {
  const { user, canAccessDashboard } = useAuth()

  return (
    <header className="w-full bg-[#0a0a0a] border-b border-white/10 px-4 sm:px-6 py-3">
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <Link to={user ? '/home' : '/'} className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity">
          <img src={logo} alt="logo" className="w-8 sm:w-9 rounded-full" />
          <span className="text-lg sm:text-xl font-bold text-white tracking-tight">Mobutu Academy</span>
        </Link>

        {user ? (
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/affiliate"
              className="hidden sm:inline px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Become an affiliate
            </Link>
            {canAccessDashboard && (
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-semibold text-sm shrink-0">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline text-sm text-gray-200 max-w-[120px] truncate">{user.email}</span>
            </Link>
          </nav>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/affiliate"
              className="hidden sm:inline text-sm text-gray-400 hover:text-white transition-colors"
            >
              Become an affiliate
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl border border-white/20 text-sm text-gray-200 hover:bg-white/5 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 transition-colors"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
