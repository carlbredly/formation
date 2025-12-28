import { Navigate } from 'react-router-dom'
import Login from './Login'
import { useAuth } from '../contexts/AuthContext'

const LoginPage = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-container">
        <div className="text-white">Chargement...</div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="app-container">
      <Login />
    </div>
  )
}

export default LoginPage

