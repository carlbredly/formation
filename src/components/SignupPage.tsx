import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Signup from './Signup'
import SEO from './SEO'

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
      <SEO
        title="Sign Up - Retouch Academy"
        url="https://retouchacademy.vercel.app/register"
      />
      <Signup />
    </div>
  )
}

export default SignupPage

