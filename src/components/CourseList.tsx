import { useState, useEffect } from 'react'
import { getCourses, deleteCourse } from '../lib/courses'
import type { Course } from '../types/course'
import EditCourseForm from './EditCourseForm'
import ManageLessons from './ManageLessons'

const CourseList = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [managingLessonsCourse, setManagingLessonsCourse] = useState<Course | null>(null)

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
    if (!confirm('Are you sure you want to delete this course?')) return

    const { error } = await deleteCourse(id)
    if (error) {
      setError(error.message || 'Error while deleting the course')
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
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111] p-6 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-white">Courses list</h2>
        <button
          onClick={loadCourses}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-colors whitespace-nowrap"
        >
          Refresh
        </button>
      </div>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      {editingCourse ? (
        <EditCourseForm 
          course={editingCourse} 
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      ) : (
        <>
          {courses.length === 0 ? (
            <p className="text-gray-400 text-sm">No courses yet</p>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border border-white/10 bg-white/5 gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm sm:text-base">{course.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">${(course.price ?? 0).toFixed(0)}</p>
                  </div>
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <button
                      onClick={() => setManagingLessonsCourse(course)}
                      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 whitespace-nowrap"
                    >
                      Lessons
                    </button>
                    <button
                      onClick={() => handleEdit(course)}
                      className="px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm hover:bg-emerald-500/30 whitespace-nowrap"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="px-3 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm hover:bg-red-500/30 whitespace-nowrap"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {managingLessonsCourse && (
        <ManageLessons
          courseId={managingLessonsCourse.id}
          courseTitle={managingLessonsCourse.title}
          onClose={() => setManagingLessonsCourse(null)}
        />
      )}
    </div>
  )
}

export default CourseList

