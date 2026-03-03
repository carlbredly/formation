import { useState, useEffect } from 'react'
import Header from './Header'
import CourseCard from './CourseCard'
import { getCourses } from '../lib/courses'
import { getMyEnrollments } from '../lib/enrollments'
import type { Course } from '../types/course'
import type { Enrollment } from '../types/course'

const Home = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [coursesData, enrollmentsData] = await Promise.all([
        getCourses(),
        getMyEnrollments()
      ])
      setCourses(coursesData)
      setEnrollments(enrollmentsData)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
            My Courses
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-400 max-w-xl">
            Access your enrolled courses or discover new ones. Click on a course to start learning.
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden animate-pulse"
              >
                <div className="aspect-[16/10] bg-white/5" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-white/10 rounded w-3/4" />
                  <div className="h-4 bg-white/5 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-400 text-center text-sm sm:text-base font-medium">
              No courses available yet
            </p>
            <p className="text-gray-500 text-center text-xs sm:text-sm mt-1 max-w-sm">
              New courses will appear here. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {courses.map((course) => {
              const enrollment = enrollments.find(e => e.courseId === course.id) ?? null
              const isActive = enrollment && enrollment.status === 'active' && new Date(enrollment.expiresAt) > new Date()
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrollment={isActive ? enrollment : null}
                />
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default Home
