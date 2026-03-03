import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Signup from './Signup'

const SignupPage = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-container">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/home" replace />
  }

  return (
    <div className="app-container">
      <Signup />
    </div>
  )
}

export default SignupPage

