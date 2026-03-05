import { useState, useEffect } from 'react'
import {
  getAdminDashboardStats,
  getSemiAdminDashboardStats,
  type AdminDashboardStats,
  type SemiAdminDashboardStats
} from '../lib/adminStats'

interface DashboardStatsProps {
  isSemiAdmin?: boolean
}

const DashboardStats = ({ isSemiAdmin = false }: DashboardStatsProps) => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [semiStats, setSemiStats] = useState<SemiAdminDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshCount, setRefreshCount] = useState(0)

  const loadStats = async () => {
    setLoading(true)
    setError('')
    if (isSemiAdmin) {
      const result = await getSemiAdminDashboardStats()
      if (result.error) {
        setError(result.error)
        setSemiStats(null)
      } else {
        setSemiStats(result.data)
        setStats(null)
        setError('')
      }
    } else {
      const result = await getAdminDashboardStats()
      if (result.data) {
        setStats(result.data)
        setSemiStats(null)
        setError('')
      } else {
        // Admin stats returned nothing (e.g. user in semi_admin only) → try semi-admin stats
        const semiResult = await getSemiAdminDashboardStats()
        if (semiResult.data) {
          setSemiStats(semiResult.data)
          setStats(null)
          setError('')
        } else {
          setError(result.error || semiResult.error || 'No data.')
          setStats(null)
        }
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    loadStats()
  }, [refreshCount, isSemiAdmin])

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111] p-8 flex items-center justify-center min-h-[200px]">
        <p className="text-gray-400">Loading statistics...</p>
      </div>
    )
  }

  if (semiStats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-gray-400">Overview (enrollments and pending payments).</p>
          <button
            type="button"
            onClick={() => setRefreshCount((c) => c + 1)}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Refresh
          </button>
        </div>
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Active enrollments</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{semiStats.totalActiveEnrollments}</p>
              <p className="text-xs text-gray-500 mt-1">valid access</p>
            </div>
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5">
              <p className="text-xs font-medium text-amber-300/90 uppercase tracking-wide mb-1">Pending payments</p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-300">{semiStats.totalPendingPayments}</p>
              <p className="text-xs text-amber-300/70 mt-1">awaiting approval</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#111] p-5 lg:col-span-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Enrollments by course</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{semiStats.enrollmentsByCourse.length}</p>
              <p className="text-xs text-gray-500 mt-1">courses with students</p>
            </div>
          </div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Enrollments by course</h2>
          {semiStats.enrollmentsByCourse.length === 0 ? (
            <p className="text-sm text-gray-400">No active enrollments.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-white/10">
                    <th className="pb-3 pr-4 font-medium">Course</th>
                    <th className="pb-3 pr-4 font-medium text-right">Active enrollments</th>
                  </tr>
                </thead>
                <tbody>
                  {semiStats.enrollmentsByCourse.map((s) => (
                    <tr key={s.course_id} className="border-b border-white/5">
                      <td className="py-3 pr-4 text-white">{s.course_title}</td>
                      <td className="py-3 pr-4 text-gray-300 text-right font-medium">{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    )
  }

  if (isSemiAdmin && (error || !semiStats)) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111] p-6 space-y-3">
        <p className="text-red-400">{error || 'No data.'}</p>
        <p className="text-sm text-gray-400">
          Run <code className="bg-white/10 px-1 rounded">supabase-semi-admin-stats-rpc.sql</code> in the Supabase SQL editor if the statistics do not load.
        </p>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111] p-6 space-y-3">
        <p className="text-red-400">{error || 'No data.'}</p>
        <p className="text-sm text-gray-400">
          Run <code className="bg-white/10 px-1 rounded">supabase-admin-stats-rpc.sql</code> if the stats RPC is missing. To grant access: <strong>full admin</strong> → <code className="bg-white/10 px-1 rounded">supabase-add-admin-user.sql</code>; <strong>dashboard + stats only (semi-admin)</strong> → <code className="bg-white/10 px-1 rounded">supabase-add-semi-admin-user.sql</code>. Replace the email and run in the Supabase SQL Editor.
        </p>
      </div>
    )
  }

  const { totalCoursesSold, totalRevenue, totalCommission, netRevenue, salesByCourse, promoCodes } = stats

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-gray-400">Figures based on approved payments and affiliate sales.</p>
        <button
          type="button"
          onClick={() => setRefreshCount((c) => c + 1)}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/10 transition-colors"
        >
          Refresh
        </button>
      </div>
      {/* KPIs */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Courses sold</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{totalCoursesSold}</p>
            <p className="text-xs text-gray-500 mt-1">approved payments</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Revenue</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">${totalRevenue.toFixed(0)}</p>
            <p className="text-xs text-gray-500 mt-1">total collected</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5">
            <p className="text-xs font-medium text-emerald-300/90 uppercase tracking-wide mb-1">Affiliate commissions</p>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-300">${totalCommission.toFixed(0)}</p>
            <p className="text-xs text-emerald-300/70 mt-1">to pay out</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Net (after commissions)</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">${netRevenue.toFixed(0)}</p>
            <p className="text-xs text-gray-500 mt-1">net revenue</p>
          </div>
        </div>
      </section>

      {/* Sales by course */}
      <section className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Sales by course</h2>
        {salesByCourse.length === 0 ? (
          <p className="text-sm text-gray-400">No sales recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-white/10">
                  <th className="pb-3 pr-4 font-medium">Course</th>
                  <th className="pb-3 pr-4 font-medium text-right">Sold</th>
                </tr>
              </thead>
              <tbody>
                {salesByCourse.map((s) => (
                  <tr key={s.course_id} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-white">{s.course_title}</td>
                    <td className="py-3 pr-4 text-gray-300 text-right font-medium">{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Promo codes & affiliates */}
      <section className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Promo codes & affiliates</h2>
        {promoCodes.length === 0 ? (
          <p className="text-sm text-gray-400">No promo codes created.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-white/10">
                  <th className="pb-3 pr-4 font-medium">Code</th>
                  <th className="pb-3 pr-4 font-medium">Affiliate email</th>
                  <th className="pb-3 pr-4 font-medium text-right">Uses</th>
                  <th className="pb-3 pr-4 font-medium text-right">Commission earned</th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.map((p) => (
                  <tr key={p.code} className="border-b border-white/5">
                    <td className="py-3 pr-4 font-mono text-white">{p.code}</td>
                    <td className="py-3 pr-4 text-gray-300 break-all">{p.affiliate_email ?? '—'}</td>
                    <td className="py-3 pr-4 text-gray-300 text-right">{p.uses}</td>
                    <td className="py-3 pr-4 text-emerald-300 text-right font-medium">${p.earned.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default DashboardStats
