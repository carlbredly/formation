import { supabase } from './supabase'

export interface PendingPaymentRow {
  id: string
  userId: string
  courseId: string
  courseTitle: string
  amount: number
  paymentMethod: string
  proofUrl: string | null
  createdAt: string
}

export const getPendingPayments = async (): Promise<PendingPaymentRow[]> => {
  const { data, error } = await supabase.rpc('get_pending_payments')
  if (error) {
    console.error('Error fetching pending payments:', error)
    return []
  }
  const rows = Array.isArray(data) ? data : []
  return rows.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    courseTitle: row.course_title || '',
    amount: Number(row.amount),
    paymentMethod: row.payment_method || '',
    proofUrl: row.proof_url,
    createdAt: row.created_at
  }))
}

export const approvePayment = async (
  paymentId: string
): Promise<{ error: any; accessCode: string | null; expiresAt: string | null }> => {
  const { data, error } = await supabase.rpc('approve_payment', { p_payment_id: paymentId })
  if (error) return { error, accessCode: null, expiresAt: null }
  const row = Array.isArray(data) ? data[0] : data
  return {
    error: null,
    accessCode: row?.access_code ?? null,
    expiresAt: row?.expires_at ?? null
  }
}
