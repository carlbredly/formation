import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/mobutu.png'
import { useAuth } from '../contexts/AuthContext'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (cooldown > 0) return
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    const { data, error } = await signUp(email, password)
    if (error) {
      const isRateLimited = error?.status === 429 || error?.code === 'over_email_send_rate_limit'
      if (isRateLimited) {
        setCooldown(30)
        setError('Too many attempts. Please wait 30 seconds before trying again.')
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(error.message || 'Error while creating your account')
      }
    } else if (data?.session) {
      navigate('/home')
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111] p-6 sm:p-8 shadow-2xl">
        <img src={logo} alt="logo" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mx-auto mb-5" />
        <h1 className="text-xl sm:text-2xl font-bold text-white text-center mb-1">Check your email</h1>
        <p className="text-sm text-gray-400 text-center mb-4">
          A confirmation link has been sent to <span className="text-emerald-400">{email}</span>.
        </p>
        <p className="text-sm text-gray-400 text-center mb-6">
          Click the link in the email to verify your account, then come back here to log in.
        </p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full py-3 rounded-xl bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 transition-colors"
        >
          Go to login
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111] p-6 sm:p-8 shadow-2xl">
      <img src={logo} alt="logo" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mx-auto mb-5" />
      <h1 className="text-xl sm:text-2xl font-bold text-white text-center mb-1">Create an account</h1>
      <p className="text-sm text-gray-400 text-center mb-6">Sign up to access your student space.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
            required
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || cooldown > 0}
          className="w-full py-3 rounded-xl bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating account...' : cooldown > 0 ? `Wait ${cooldown}s...` : 'Create my account'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => navigate('/login')}
        className="mt-5 w-full text-center text-sm text-gray-400 hover:text-white transition-colors"
      >
        Already have an account? Log in
      </button>
    </div>
  )
}

export default Signup
