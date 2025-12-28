import { useState } from 'react'
import { addStudent } from '../lib/students'

interface AddStudentFormProps {
  onSuccess: () => void
}

const AddStudentForm = ({ onSuccess }: AddStudentFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const { error } = await addStudent(email, password)

    if (error) {
      setError(error.message || 'Erreur lors de l\'ajout de l\'étudiant')
    } else {
      setSuccess('Étudiant ajouté avec succès')
      setEmail('')
      setPassword('')
      onSuccess()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#181818] rounded-lg p-4 sm:p-6 border border-gray-800">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Ajouter un étudiant</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-700 rounded-md bg-[#0F0F0F] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="etudiant@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Mot de passe *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-700 rounded-md bg-[#0F0F0F] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Mot de passe"
            required
            minLength={6}
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Ajout en cours...' : 'Ajouter l\'étudiant'}
        </button>
      </div>
    </form>
  )
}

export default AddStudentForm

