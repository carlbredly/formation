import { supabase } from './supabase'

const COMMISSION_RATE = 0.15

// Create (or retrieve) the affiliate profile for the logged-in user
export const ensureAffiliateProfile = async (fullName?: string) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: userError || new Error('User not logged in'), data: null }
  }

  const { data: existing, error: fetchError } = await supabase
    .from('affiliates')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchError) {
    return { error: fetchError, data: null }
  }

  if (existing) {
    return { error: null, data: existing }
  }

  const { data, error } = await supabase
    .from('affiliates')
    .insert({ user_id: user.id, full_name: fullName })
    .select('*')
    .single()

  return { error, data }
}

// Create a promo code for the logged-in affiliate
export const createAffiliateCode = async (code: string) => {
  const profileResult = await ensureAffiliateProfile()
  if (profileResult.error || !profileResult.data) {
    return { error: profileResult.error, data: null }
  }

  const { data, error } = await supabase
    .from('affiliate_codes')
    .insert({
      affiliate_id: profileResult.data.id,
      code: code.toUpperCase(),
    })
    .select('*')
    .single()

  return { error, data }
}

// Get affiliate codes for the logged-in user
export const getMyAffiliateCodes = async () => {
  const { data, error } = await supabase
    .from('affiliate_codes')
    .select('*')
    .order('created_at', { ascending: false })

  return { error, data }
}

// Get affiliate sales summary for the logged-in user
export const getMyAffiliateSalesSummary = async () => {
  const { data, error } = await supabase
    .from('affiliate_sales')
    .select('amount, commission_amount')
    .order('created_at', { ascending: false })

  if (error || !data) {
    return { error, data: null as any }
  }

  const totalSales = data.reduce((sum, row) => sum + Number(row.amount), 0)
  const totalCommission = data.reduce((sum, row) => sum + Number(row.commission_amount), 0)

  return {
    error: null,
    data: {
      totalSales,
      totalCommission,
      rate: COMMISSION_RATE,
      count: data.length,
    },
  }
}

export interface AffiliateSaleRow {
  id: string
  amount: number
  commission_amount: number
  commission_rate: number
  created_at: string
  affiliate_code_id: string
  affiliate_codes: { code: string } | null
}

// Get detailed list of affiliate sales (with code name) for the logged-in user
export const getMyAffiliateSales = async (): Promise<{ error: unknown; data: AffiliateSaleRow[] | null }> => {
  const { data, error } = await supabase
    .from('affiliate_sales')
    .select(`
      id,
      amount,
      commission_amount,
      commission_rate,
      created_at,
      affiliate_code_id,
      affiliate_codes ( code )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return { error, data: null }
  }

  const rows: AffiliateSaleRow[] = (data || []).map((row: any) => ({
    id: row.id,
    amount: Number(row.amount),
    commission_amount: Number(row.commission_amount),
    commission_rate: Number(row.commission_rate),
    created_at: row.created_at,
    affiliate_code_id: row.affiliate_code_id,
    affiliate_codes: row.affiliate_codes ?? null,
  }))

  return { error: null, data: rows }
}

