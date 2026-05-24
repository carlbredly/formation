import { Navigate } from 'react-router-dom'
import Login from './Login'
import { useAuth } from '../contexts/AuthContext'
import SEO from './SEO'

const LoginPage = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-container">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="app-container">
      <SEO
        title="Login - Retouch Academy"
        url="https://retouchacademy.vercel.app/login"
      />
      <Login />
    </div>
  )
}

export default LoginPage

