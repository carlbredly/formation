import { useState, useEffect } from 'react'
import Header from './Header'
import AddCourseForm from './AddCourseForm'
import AddStudentForm from './AddStudentForm'
import CourseList from './CourseList'
import StudentList from './StudentList'
import EnrollmentsAdmin from './EnrollmentsAdmin'
import PaymentsAdmin from './PaymentsAdmin'
import DashboardStats from './DashboardStats'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const { role } = useAuth()
  const isFullAdmin = role === 'admin'
  const [activeTab, setActiveTab] = useState<'stats' | 'courses' | 'students' | 'enrollments' | 'payments'>('students')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  const allTabs = [
    { id: 'stats' as const, label: 'Statistics', adminOnly: true },
    { id: 'courses' as const, label: 'Courses', adminOnly: true },
    { id: 'students' as const, label: 'Students', adminOnly: false },
    { id: 'enrollments' as const, label: 'Enrollments', adminOnly: false },
    { id: 'payments' as const, label: 'Payments', adminOnly: false }
  ]
  const tabs = allTabs.filter((t) => !t.adminOnly || isFullAdmin)
  useEffect(() => {
    const allowed = allTabs.filter((t) => !t.adminOnly || isFullAdmin)
    if (allowed.length && !allowed.some((t) => t.id === activeTab)) {
      setActiveTab(allowed[0].id)
    }
  }, [isFullAdmin, activeTab])

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-6">Admin Dashboard</h1>

        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit mb-6 overflow-x-auto">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm ${
                activeTab === id ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'stats' && (
          <DashboardStats key={refreshKey} />
        )}
        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <AddCourseForm key={refreshKey} onSuccess={handleSuccess} />
            <CourseList key={`list-${refreshKey}`} />
          </div>
        )}
        {activeTab === 'students' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {isFullAdmin && <AddStudentForm key={refreshKey} onSuccess={handleSuccess} />}
            <StudentList key={`list-${refreshKey}`} isFullAdmin={isFullAdmin} />
          </div>
        )}
        {activeTab === 'enrollments' && (
          <div className="max-w-lg">
            <EnrollmentsAdmin />
          </div>
        )}
        {activeTab === 'payments' && (
          <div className="max-w-2xl">
            <PaymentsAdmin />
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard

