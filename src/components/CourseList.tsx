import { useState, useEffect } from 'react'
import { getCourses, deleteCourse } from '../lib/courses'
import type { Course } from '../types/course'

const CourseList = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadCourses = async () => {
    setLoading(true)
    setError('')
    const data = await getCourses()
    setCourses(data)
    setLoading(false)
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return

    const { error } = await deleteCourse(id)
    if (error) {
      setError(error.message || 'Erreur lors de la suppression')
    } else {
      loadCourses()
    }
  }

  if (loading) {
    return <div className="text-white">Chargement...</div>
  }

  return (
    <div className="bg-[#181818] rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Liste des cours</h2>
        <button
          onClick={loadCourses}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
        >
          Actualiser
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {courses.length === 0 ? (
        <p className="text-gray-400">Aucun cours pour le moment</p>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex items-center justify-between p-4 bg-[#0F0F0F] rounded-md border border-gray-700"
            >
              <div className="flex-1">
                <h3 className="text-white font-semibold">{course.title}</h3>
                {course.description && (
                  <p className="text-sm text-gray-400 mt-1">{course.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">ID YouTube: {course.youtubeVideoId}</p>
              </div>
              <button
                onClick={() => handleDelete(course.id)}
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

export default CourseList

