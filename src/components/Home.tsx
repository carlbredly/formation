import { useState, useEffect } from 'react'
import Header from './Header'
import CourseCard from './CourseCard'
import { getCourses } from '../lib/courses'
import type { Course } from '../types/course'

const Home = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCourses = async () => {
      const data = await getCourses()
      setCourses(data)
      setLoading(false)
    }
    loadCourses()
  }, [])

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Header />
      <main className="w-full mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white pb-4">Mes Cours</h1>
        {loading ? (
          <div className="text-white">Chargement des cours...</div>
        ) : courses.length === 0 ? (
          <div className=" fle text-gray-400 text-center justify-center items-center my-auto"> Les cours seront disonible le 9 Janvier </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main> 
    </div>
  )
}

export default Home

