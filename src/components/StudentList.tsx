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
    <div className="bg-[#181818] rounded-lg p-4 sm:p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-white">Liste des étudiants</h2>
        <button
          onClick={loadStudents}
          className="px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-xs sm:text-sm whitespace-nowrap"
        >
          Actualiser
        </button>
      </div>

      {error && <p className="text-xs sm:text-sm text-red-500 mb-4">{error}</p>}

      {students.length === 0 ? (
        <p className="text-gray-400 text-sm sm:text-base">Aucun étudiant pour le moment</p>
      ) : (
        <div className="space-y-3">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-[#0F0F0F] rounded-md border border-gray-700 gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm sm:text-base break-all">{student.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Inscrit le {new Date(student.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <button
                onClick={() => handleDelete(student.id)}
                className="w-full sm:w-auto sm:ml-4 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs sm:text-sm whitespace-nowrap"
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

