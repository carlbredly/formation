import { supabase } from './supabase'
import type { CoursePayment } from '../types/course'

const BUCKET = 'payment-proofs'

export const createPaymentRequest = async (params: {
  courseId: string
  amount: number
  paymentMethod: 'zelle' | 'moncash' | 'other'
  proofFile?: File
}): Promise<{ error: any; payment: CoursePayment | null }> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: new Error('Not logged in'), payment: null }

  let proofUrl: string | null = null
  if (params.proofFile) {
    const ext = params.proofFile.name.split('.').pop() || 'jpg'
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, params.proofFile, { upsert: false })
    if (uploadError) return { error: uploadError, payment: null }
    proofUrl = path
  }

  const { data, error } = await supabase
    .from('course_payments')
    .insert({
      user_id: user.id,
      course_id: params.courseId,
      amount: params.amount,
      payment_method: params.paymentMethod,
      proof_url: proofUrl,
      status: 'pending'
    })
    .select('*')
    .single()

  if (error) return { error, payment: null }

  return {
    error: null,
    payment: {
      id: data.id,
      userId: data.user_id,
      courseId: data.course_id,
      amount: Number(data.amount),
      paymentMethod: data.payment_method,
      proofUrl: data.proof_url,
      status: data.status,
      createdAt: data.created_at,
      processedAt: data.processed_at
    }
  }
}

export const getMyPayments = async (): Promise<CoursePayment[]> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('course_payments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    amount: Number(row.amount),
    paymentMethod: row.payment_method,
    proofUrl: row.proof_url,
    status: row.status,
    createdAt: row.created_at,
    processedAt: row.processed_at
  }))
}

/** Get signed URL for proof (for viewing in app). Pass the path stored in proof_url. */
export const getProofSignedUrl = async (proofPathOrUrl: string | null): Promise<string | null> => {
  if (!proofPathOrUrl) return null
  if (proofPathOrUrl.startsWith('http')) return proofPathOrUrl
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(proofPathOrUrl, 3600)
  return data?.signedUrl ?? null
}
