import { useState, useEffect } from 'react'
import { getEnrollmentAccessCodes, type EnrollmentAccessCodeRow } from '../lib/enrollments'

const AccessCodesList = () => {
  const [rows, setRows] = useState<EnrollmentAccessCodeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      const { data, error: err } = await getEnrollmentAccessCodes()
      setLoading(false)
      if (err) {
        setError('Failed to load access codes.')
        return
      }
      setRows(data ?? [])
    }
    load()
  }, [])

  const copyCode = async (enrollmentId: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedId(enrollmentId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setError('Could not copy to clipboard.')
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111] p-6">
        <p className="text-gray-400">Loading access codes...</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Access codes</h2>
      <p className="text-sm text-gray-400 mb-4">
        List of generated course access codes. Copy and share with students so they can unlock the course from My Courses.
      </p>
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      {rows.length === 0 ? (
        <p className="text-gray-500 text-sm">No access codes yet. Create an enrollment in the Enrollments tab to generate codes.</p>
      ) : (
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-gray-400 border-b border-white/10">
                <th className="pb-3 pr-3 font-medium">Student</th>
                <th className="pb-3 pr-3 font-medium">Course</th>
                <th className="pb-3 pr-3 font-medium">Access code</th>
                <th className="pb-3 pr-3 font-medium">Expires</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.enrollment_id} className="border-b border-white/5">
                  <td className="py-3 pr-3 text-gray-200 max-w-[180px] truncate" title={r.user_email ?? ''}>
                    {r.user_email ?? '—'}
                  </td>
                  <td className="py-3 pr-3 text-gray-200 max-w-[180px] truncate" title={r.course_title ?? ''}>
                    {r.course_title ?? '—'}
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 rounded bg-white/5 text-emerald-300 font-mono text-xs">
                        {r.access_code}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyCode(r.enrollment_id, r.access_code)}
                        className="shrink-0 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-medium hover:bg-emerald-500/30 transition-colors"
                      >
                        {copiedId === r.enrollment_id ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(r.expires_at).toLocaleDateString('en-US')}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        r.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : r.status === 'expired'
                            ? 'bg-gray-500/20 text-gray-400'
                            : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AccessCodesList
