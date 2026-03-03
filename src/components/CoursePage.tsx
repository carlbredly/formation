import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from './Header'
import { getCourses } from '../lib/courses'
import { getEnrollmentForCourse } from '../lib/enrollments'
import { getLessonsByCourseId } from '../lib/lessons'
import { getProgressForEnrollment, setLessonCompleted } from '../lib/progress'
import type { Course } from '../types/course'
import type { Lesson } from '../types/course'

const CoursePage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null)
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      const [coursesList, enrollment] = await Promise.all([
        getCourses(),
        getEnrollmentForCourse(id)
      ])
      const c = coursesList.find(x => x.id === id)
      if (!c) {
        setCourse(null)
        setLoading(false)
        return
      }
      setCourse(c)
      if (!enrollment) {
        setEnrollmentId(null)
        setLessons([])
        setLoading(false)
        return
      }
      setEnrollmentId(enrollment.id)
      const lessonsList = await getLessonsByCourseId(id)
      setLessons(lessonsList)
      const progress = await getProgressForEnrollment(enrollment.id)
      setCompletedLessonIds(new Set(progress.filter(p => p.completed).map(p => p.lessonId)))
      setLoading(false)
    }
    load()
  }, [id])

  const handleToggleComplete = async (lessonId: string) => {
    if (!enrollmentId) return
    const currentlyCompleted = completedLessonIds.has(lessonId)
    const { error } = await setLessonCompleted(enrollmentId, lessonId, !currentlyCompleted)
    if (!error) {
      setCompletedLessonIds(prev => {
        const next = new Set(prev)
        if (currentlyCompleted) next.delete(lessonId)
        else next.add(lessonId)
        return next
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-300 mb-4">Course not found.</p>
          <button onClick={() => navigate('/home')} className="text-emerald-400 hover:text-emerald-300">← Back to courses</button>
        </main>
      </div>
    )
  }

  if (!enrollmentId) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <main className="max-w-md mx-auto px-4 py-12 text-center">
          <p className="text-gray-300 mb-6">You need access to view this course. Use your access code on the course card from My Courses.</p>
          <button onClick={() => navigate('/home')} className="px-4 py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400">Go to My Courses</button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6">
          <button onClick={() => navigate('/home')} className="text-sm text-gray-400 hover:text-white mb-2">← Back to courses</button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{course.title}</h1>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Lessons</h2>
          {lessons.length === 0 ? (
            <p className="text-gray-400 text-sm">No lessons yet. Check back later.</p>
          ) : (
            <ul className="space-y-4">
              {lessons.map((lesson, index) => {
                const completed = completedLessonIds.has(lesson.id)
                const embedUrl = lesson.youtubeVideoId
                  ? `https://www.youtube.com/embed/${lesson.youtubeVideoId}`
                  : null
                return (
                  <li
                    key={lesson.id}
                    className="rounded-2xl border border-white/10 bg-[#111] overflow-hidden"
                  >
                    <div className="flex items-center gap-3 p-4 border-b border-white/5">
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(lesson.id)}
                        className="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                        style={{
                          borderColor: completed ? 'rgb(16, 185, 129)' : 'rgba(255,255,255,0.3)',
                          backgroundColor: completed ? 'rgba(16, 185, 129, 0.2)' : 'transparent'
                        }}
                        title={completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {completed && <span className="text-emerald-400 text-sm">✓</span>}
                      </button>
                      <span className="text-sm text-gray-400 w-8">#{index + 1}</span>
                      <p className="font-medium text-white flex-1">{lesson.title}</p>
                      {completed && <span className="text-xs text-emerald-400">Done</span>}
                    </div>
                    <div className="p-4 space-y-3">
                      {lesson.description && (
                        <p className="text-sm text-gray-300">{lesson.description}</p>
                      )}
                      {embedUrl && (
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                            src={embedUrl}
                            title={lesson.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                      {lesson.resources && lesson.resources.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 mb-2">Resources</p>
                          <div className="flex flex-col gap-2">
                            {lesson.resources.map((res) => (
                              <a
                                key={res.id}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
                              >
                                {res.title}
                                <span className="text-xs">→</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <div className="mt-6 text-sm text-gray-400">
          {completedLessonIds.size} / {lessons.length} lessons completed
        </div>
      </main>
    </div>
  )
}

export default CoursePage
