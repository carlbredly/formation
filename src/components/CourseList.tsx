import { useState, useEffect } from 'react'
import { getCourses, deleteCourse } from '../lib/courses'
import type { Course } from '../types/course'
import EditCourseForm from './EditCourseForm'

const CourseList = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

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

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
  }

  const handleEditSuccess = () => {
    setEditingCourse(null)
    loadCourses()
  }

  const handleEditCancel = () => {
    setEditingCourse(null)
  }

  if (loading) {
    return <div className="text-white">Chargement...</div>
  }

  return (
    <div className="bg-[#181818] rounded-lg p-4 sm:p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-white">Liste des cours</h2>
        <button
          onClick={loadCourses}
          className="px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-xs sm:text-sm whitespace-nowrap"
        >
          Actualiser
        </button>
      </div>

      {error && <p className="text-xs sm:text-sm text-red-500 mb-4">{error}</p>}

      {editingCourse ? (
        <EditCourseForm 
          course={editingCourse} 
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      ) : (
        <>
          {courses.length === 0 ? (
            <p className="text-gray-400 text-sm sm:text-base">Aucun cours pour le moment</p>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-[#0F0F0F] rounded-md border border-gray-700 gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm sm:text-base wrap-break-word">{course.title}</h3>
                    {course.description && (
                      <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-2">{course.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1 break-all">ID YouTube: {course.youtubeVideoId}</p>
                  </div>
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <button
                      onClick={() => handleEdit(course)}
                      className="w-full sm:w-auto px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs sm:text-sm whitespace-nowrap"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="w-full sm:w-auto px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs sm:text-sm whitespace-nowrap"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CourseList

