import { useState, useEffect } from 'react'
import { getStudents, deleteStudent } from '../lib/students'
import type { Student } from '../lib/students'

const StudentList = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStudents = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getStudents()
      setStudents(data)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des étudiants')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) return

    const { error } = await deleteStudent(id)
    if (error) {
      setError(error.message || 'Erreur lors de la suppression')
    } else {
      loadStudents()
    }
  }

  if (loading) {
    return <div className="text-white">Chargement...</div>
  }

  return (
    <div className="bg-[#181818] rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Liste des étudiants</h2>
        <button
          onClick={loadStudents}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
        >
          Actualiser
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {students.length === 0 ? (
        <p className="text-gray-400">Aucun étudiant pour le moment</p>
      ) : (
        <div className="space-y-3">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-4 bg-[#0F0F0F] rounded-md border border-gray-700"
            >
              <div className="flex-1">
                <p className="text-white font-semibold">{student.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Inscrit le {new Date(student.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <button
                onClick={() => handleDelete(student.id)}
                className="ml-4 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudentList

