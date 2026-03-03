import { useState, useEffect } from 'react'
import { getStudents, deleteStudent } from '../lib/students'
import {
  getAdminUserIds,
  getSemiAdminUserIds,
  addUserAsAdmin,
  removeUserAsAdmin,
  addUserAsSemiAdmin,
  removeUserAsSemiAdmin
} from '../lib/adminUsers'
import type { Student } from '../lib/students'

interface StudentListProps {
  isFullAdmin: boolean
}

const StudentList = ({ isFullAdmin }: StudentListProps) => {
  const [students, setStudents] = useState<Student[]>([])
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set())
  const [semiAdminIds, setSemiAdminIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [promotingId, setPromotingId] = useState<string | null>(null)

  const loadStudents = async () => {
    setLoading(true)
    setError('')
    try {
      const fetches: [Promise<Student[]>, Promise<string[]>, Promise<string[]>] = [
        getStudents(),
        getAdminUserIds(),
        getSemiAdminUserIds()
      ]
      const [data, adminList, semiList] = await Promise.all(fetches)
      setStudents(data)
      setAdminIds(new Set(adminList))
      setSemiAdminIds(new Set(semiList))
    } catch (err: any) {
      setError(err.message || 'Error while loading students')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    const { error } = await deleteStudent(id)
    if (error) {
      setError(error.message || 'Error while deleting the student')
    } else {
      loadStudents()
    }
  }

  const handlePromoteAdmin = async (id: string) => {
    const isAdmin = adminIds.has(id)
    setPromotingId(id)
    setError('')
    setSuccess('')
    const result = isAdmin ? await removeUserAsAdmin(id) : await addUserAsAdmin(id)
    setPromotingId(null)
    if (result.error) setError(result.error)
    else {
      setSuccess(isAdmin ? 'Admin rights removed.' : 'User promoted to administrator.')
      loadStudents()
    }
  }

  const handlePromoteSemiAdmin = async (id: string) => {
    const isSemi = semiAdminIds.has(id)
    setPromotingId(id)
    setError('')
    setSuccess('')
    const result = isSemi ? await removeUserAsSemiAdmin(id) : await addUserAsSemiAdmin(id)
    setPromotingId(null)
    if (result.error) setError(result.error)
    else {
      setSuccess(isSemi ? 'Semi-admin rights removed.' : 'User promoted to semi-admin.')
      loadStudents()
    }
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
      <div className="flex items-center justify-between mb-5 gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          {isFullAdmin ? 'Students list' : 'Students (read-only)'}
        </h2>
        <button
          onClick={loadStudents}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/10 transition-colors whitespace-nowrap"
        >
          Refresh
        </button>
      </div>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      {success && <p className="text-sm text-emerald-400 mb-4">{success}</p>}

      {students.length === 0 ? (
        <p className="text-gray-400 text-sm py-4">No students yet.</p>
      ) : (
        <ul className="student-list-scroll space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {students.map((student) => (
            <li
              key={student.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
            >
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {(student.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm sm:text-base truncate" title={student.email}>
                    {student.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-gray-500">
                      Registered on {new Date(student.created_at).toLocaleDateString('en-US')}
                    </span>
                    <span className="text-gray-600">·</span>
                    <div className="flex items-center gap-1.5">
                      {adminIds.has(student.id) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-medium">
                          Admin
                        </span>
                      )}
                      {semiAdminIds.has(student.id) && !adminIds.has(student.id) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-sky-500/15 border border-sky-500/25 text-sky-300 text-xs font-medium">
                          Semi-admin
                        </span>
                      )}
                      {!adminIds.has(student.id) && !semiAdminIds.has(student.id) && (
                        <span className="text-xs text-gray-500">Student</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isFullAdmin && (
                <div className="flex items-center gap-2 sm:gap-2 flex-wrap sm:flex-nowrap sm:shrink-0">
                  <div className="flex items-center rounded-xl border border-white/10 overflow-hidden">
                    <button
                      onClick={() => handlePromoteSemiAdmin(student.id)}
                      disabled={!!promotingId}
                      title={semiAdminIds.has(student.id) ? 'Remove semi-admin role' : 'Promote to semi-admin'}
                      className={`px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
                        semiAdminIds.has(student.id)
                          ? 'bg-sky-500/20 text-sky-300 border-r border-white/10 hover:bg-sky-500/25'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-sky-300'
                      }`}
                    >
                      Semi-admin
                    </button>
                    <button
                      onClick={() => handlePromoteAdmin(student.id)}
                      disabled={!!promotingId}
                      title={adminIds.has(student.id) ? 'Remove admin role' : 'Promote to admin'}
                      className={`px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
                        adminIds.has(student.id)
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/25'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-emerald-300'
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(student.id)}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-red-300/90 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors whitespace-nowrap"
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default StudentList

