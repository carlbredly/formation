import { useState, useEffect } from 'react'
import { getPendingPayments, approvePayment, type PendingPaymentRow } from '../lib/adminPayments'
import { getProofSignedUrl } from '../lib/payments'

const PaymentsAdmin = () => {
  const [payments, setPayments] = useState<PendingPaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    const data = await getPendingPayments()
    setPayments(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleApprove = async (id: string) => {
    setMessage('')
    setApprovingId(id)
    const { error, accessCode, expiresAt } = await approvePayment(id)
    setApprovingId(null)
    if (error) {
      setMessage(error.message || 'Failed to approve.')
      return
    }
    setMessage(`Approved. Access code: ${accessCode} (expires ${expiresAt ? new Date(expiresAt).toLocaleDateString() : ''}). Share with student.`)
    load()
  }

  const openProof = async (proofUrl: string | null) => {
    if (!proofUrl) return
    const url = await getProofSignedUrl(proofUrl)
    if (url) window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111] p-6 flex items-center justify-center">
        <p className="text-gray-400">Loading payments...</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Pending payments</h2>
      <p className="text-sm text-gray-400 mb-4">Approve payment to grant course access. An access code (3 months) is created for the student.</p>
      {message && <p className="text-sm text-emerald-400 mb-4">{message}</p>}
      {payments.length === 0 ? (
        <p className="text-gray-400 text-sm">No pending payments.</p>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
              <div>
                <p className="text-white font-medium">{p.courseTitle}</p>
                <p className="text-xs text-gray-400">Amount: ${p.amount.toFixed(0)} · {p.paymentMethod} · {new Date(p.createdAt).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500 truncate">User: {p.userId}</p>
              </div>
              <div className="flex gap-2">
                {p.proofUrl && (
                  <button
                    type="button"
                    onClick={() => openProof(p.proofUrl)}
                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10"
                  >
                    View proof
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleApprove(p.id)}
                  disabled={!!approvingId}
                  className="px-3 py-2 rounded-xl bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 disabled:opacity-50"
                >
                  {approvingId === p.id ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PaymentsAdmin
