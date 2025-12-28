import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/mobutu.png'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message || 'Erreur de connexion')
    } else {
      navigate('/')
    }
    
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-lg bg-[#181818] w-full max-w-xs sm:max-w-sm gap-2">
        <img src={logo} alt="logo" className="w-12  sm:w-14  mb-3 sm:mb-4" />
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Welcome</h1>
        <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 text-center">login to get access to your account</p>
        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
            <div className="flex flex-col gap-1">
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 sm:p-3 border border-gray-700 rounded-md bg-[#0F0F0F] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm sm:text-base" 
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 sm:p-3 border border-gray-700 rounded-md bg-[#0F0F0F] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm sm:text-base" 
                required
              />
            </div>
            {error && <p className="text-xs sm:text-sm text-red-500 w-full mt-1 wrap-break-word">{error}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full p-2.5 sm:p-3 mt-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
            >
              {loading ? 'Connexion...' : 'Login'}
            </button>
        </form>
    </div>
  )
}

export default Login