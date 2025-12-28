import { useState } from 'react'
import Header from './Header'
import AddCourseForm from './AddCourseForm'
import AddStudentForm from './AddStudentForm'
import CourseList from './CourseList'
import StudentList from './StudentList'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'students'>('courses')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Dashboard Admin</h1>

        <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 border-b border-gray-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-3 sm:px-4 py-2 font-semibold transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'courses'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Cours
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3 sm:px-4 py-2 font-semibold transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'students'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Étudiants
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {activeTab === 'courses' ? (
            <>
              <AddCourseForm key={refreshKey} onSuccess={handleSuccess} />
              <CourseList key={`list-${refreshKey}`} />
            </>
          ) : (
            <>
              <AddStudentForm key={refreshKey} onSuccess={handleSuccess} />
              <StudentList key={`list-${refreshKey}`} />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard

