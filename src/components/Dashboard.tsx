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
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Dashboard Admin</h1>

        <div className="flex gap-4 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'courses'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Cours
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'students'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Étudiants
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

