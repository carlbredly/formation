import { useEffect, useState, useMemo } from 'react'
import Header from './Header'
import {
  createAffiliateCode,
  getMyAffiliateCodes,
  getMyAffiliateSalesSummary,
  getMyAffiliateSales,
  type AffiliateSaleRow,
} from '../lib/affiliates'

interface AffiliateCode {
  id: string
  code: string
  is_active: boolean
  created_at: string
}

interface AffiliateSummary {
  totalSales: number
  totalCommission: number
  rate: number
  count: number
}

const AffiliatePage = () => {
  const [codes, setCodes] = useState<AffiliateCode[]>([])
  const [summary, setSummary] = useState<AffiliateSummary | null>(null)
  const [sales, setSales] = useState<AffiliateSaleRow[]>([])
  const [newCode, setNewCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')

      const [
        { data: codesData, error: codesError },
        { data: summaryData, error: summaryError },
        { data: salesData, error: salesError },
      ] = await Promise.all([
        getMyAffiliateCodes(),
        getMyAffiliateSalesSummary(),
        getMyAffiliateSales(),
      ])

      if (codesError || summaryError || salesError) {
        setError('Unable to load your affiliate data. Please try again later.')
      } else {
        setCodes(codesData || [])
        setSummary(summaryData ?? null)
        setSales(salesData || [])
      }

      setLoading(false)
    }

    void loadData()
  }, [])

  // Per-code stats: how many times each code was used and total earned
  const perCodeStats = useMemo(() => {
    const map: Record<string, { uses: number; earned: number }> = {}
    for (const sale of sales) {
      const id = sale.affiliate_code_id
      if (!map[id]) map[id] = { uses: 0, earned: 0 }
      map[id].uses += 1
      map[id].earned += sale.commission_amount
    }
    return map
  }, [sales])

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const trimmed = newCode.trim()
    if (!trimmed) {
      setError('Please enter a promo code.')
      return
    }

    setCreating(true)

    const { data, error } = await createAffiliateCode(trimmed)

    if (error) {
      if (error.message?.includes('duplicate key')) {
        setError('This promo code already exists. Please choose another one.')
      } else {
        setError(error.message || 'Error while creating the promo code.')
      }
    } else if (data) {
      setCodes((prev) => [data, ...prev])
      setSuccess('Your promo code has been created successfully.')
      setNewCode('')
    }

    setCreating(false)
  }

  const getCodeLabel = (sale: AffiliateSaleRow) =>
    sale.affiliate_codes?.code ?? '—'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">My affiliate program</h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            Manage your promo codes, see how often they are used, and track your earnings. Share your code
            with your audience and earn a commission on each qualified sale.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-[#111] p-8 flex items-center justify-center">
            <p className="text-gray-400">Loading your affiliate data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats overview */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Overview</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-5">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Times your code was used</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    {summary?.count ?? 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">qualified sales</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-5">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Revenue generated</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    ${(summary?.totalSales ?? 0).toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">total sales amount</p>
                </div>
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 sm:p-5">
                  <p className="text-emerald-300/90 text-xs uppercase tracking-wide mb-1">Your earnings</p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-300">
                    ${(summary?.totalCommission ?? 0).toFixed(0)}
                  </p>
                  <p className="text-xs text-emerald-300/70 mt-1">total commission</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-5">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Commission rate</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    {summary ? `${(summary.rate * 100).toFixed(0)}%` : '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">per sale</p>
                </div>
              </div>
            </section>

            {/* My promo codes with per-code stats */}
            <section className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">My promo codes</h2>
              {codes.length === 0 ? (
                <p className="text-sm text-gray-400">
                  You don&apos;t have any promo code yet. Create one below to start recommending the training.
                </p>
              ) : (
                <div className="space-y-3">
                  {codes.map((code) => {
                    const stats = perCodeStats[code.id]
                    const uses = stats?.uses ?? 0
                    const earned = stats?.earned ?? 0
                    return (
                      <div
                        key={code.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-lg font-semibold text-white">{code.code}</span>
                          <span className="text-xs text-gray-400">
                            Created on {new Date(code.created_at).toLocaleDateString('en-US')}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                          <div className="text-sm">
                            <span className="text-gray-400">Used </span>
                            <span className="font-semibold text-white">{uses}</span>
                            <span className="text-gray-400"> time{uses !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-400">Earned </span>
                            <span className="font-semibold text-emerald-300">${earned.toFixed(0)}</span>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              code.is_active
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
                            }`}
                          >
                            {code.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Recent sales */}
            <section className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Recent sales</h2>
              {sales.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No sales recorded yet. Share your promo code to start earning.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-white/10">
                        <th className="pb-3 pr-4 font-medium">Date</th>
                        <th className="pb-3 pr-4 font-medium">Code</th>
                        <th className="pb-3 pr-4 font-medium text-right">Sale amount</th>
                        <th className="pb-3 pr-4 font-medium text-right">Your commission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.slice(0, 20).map((sale) => (
                        <tr key={sale.id} className="border-b border-white/5">
                          <td className="py-3 pr-4 text-gray-300">
                            {new Date(sale.created_at).toLocaleDateString('en-US', {
                              dateStyle: 'short',
                            })}
                          </td>
                          <td className="py-3 pr-4 font-mono text-white">{getCodeLabel(sale)}</td>
                          <td className="py-3 pr-4 text-gray-300 text-right">${sale.amount.toFixed(0)}</td>
                          <td className="py-3 pr-4 text-emerald-300 text-right font-medium">
                            ${sale.commission_amount.toFixed(0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {sales.length > 20 && (
                <p className="text-xs text-gray-500 mt-3">Showing last 20 sales</p>
              )}
            </section>

            {/* Create promo code */}
            <section className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4 sm:p-6 space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-emerald-200">Create a promo code</h2>
              <p className="text-xs sm:text-sm text-emerald-100/80">
                Choose a simple and professional code (e.g. <span className="font-mono">YOURNAME15</span>). This
                code will be used by your audience when purchasing the training.
              </p>
              <form onSubmit={handleCreateCode} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MOBUTU15"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                />
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 sm:px-6 py-3 rounded-xl bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create my code'}
                </button>
              </form>
              {error && <p className="text-xs text-red-400">{error}</p>}
              {success && <p className="text-xs text-emerald-300">{success}</p>}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default AffiliatePage
