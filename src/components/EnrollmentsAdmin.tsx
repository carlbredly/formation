import { useState, useEffect } from 'react'
import { getStudents } from '../lib/students'
import { getCourses } from '../lib/courses'
import { createEnrollmentWithCode } from '../lib/enrollments'
import type { Student } from '../lib/students'
import type { Course } from '../types/course'

const EnrollmentsAdmin = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ accessCode: string; expiresAt: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, c] = await Promise.all([getStudents(), getCourses()])
        setStudents(s)
        setCourses(c)
        if (c.length) setSelectedCourseId(c[0].id)
        if (s.length) setSelectedUserId(s[0].id)
      } catch (e) {
        setError('Failed to load students or courses.')
      }
    }
    load()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResult(null)
    if (!selectedUserId || !selectedCourseId) return
    setLoading(true)
    const { error: err, accessCode, expiresAt } = await createEnrollmentWithCode(selectedUserId, selectedCourseId)
    setLoading(false)
    if (err) {
      setError(err.message || 'Failed to create enrollment.')
      return
    }
    if (accessCode && expiresAt) setResult({ accessCode, expiresAt })
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Create enrollment</h2>
      <p className="text-sm text-gray-400 mb-4">
        Assign a student to a course. An access code (valid 3 months) is generated. Share this code with the student so they can access the course.
      </p>
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Student</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.email}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Course</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {result && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-sm font-semibold text-emerald-300">Access code (share with student):</p>
            <p className="font-mono text-lg text-white mt-1">{result.accessCode}</p>
            <p className="text-xs text-gray-400 mt-1">Expires: {new Date(result.expiresAt).toLocaleDateString('en-US')}</p>
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !students.length || !courses.length}
          className="w-full py-3 rounded-xl bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating...' : 'Create enrollment & get code'}
        </button>
      </form>
    </div>
  )
}

export default EnrollmentsAdmin
