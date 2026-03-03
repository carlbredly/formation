import { supabase } from './supabase'

export type DashboardRole = 'admin' | 'semi_admin' | null

export const getMyRole = async (): Promise<DashboardRole> => {
  const { data, error } = await supabase.rpc('get_my_role')
  if (error || data == null) return null
  const r = Array.isArray(data) ? data[0] : data
  if (r === 'admin' || r === 'semi_admin') return r
  return null
}

export const getAdminUserIds = async (): Promise<string[]> => {
  const { data, error } = await supabase.rpc('get_admin_user_ids')
  if (error) {
    console.error('Error fetching admin ids:', error)
    return []
  }
  const rows = Array.isArray(data) ? data : []
  return rows.map((row: { user_id: string }) => row.user_id)
}

export const addUserAsAdmin = async (userId: string): Promise<{ error: string | null; success: boolean }> => {
  const { data, error } = await supabase.rpc('add_user_as_admin', { p_user_id: userId })
  if (error) return { error: error.message, success: false }
  const row = Array.isArray(data) ? data[0] : data
  if (row?.success) return { error: null, success: true }
  return { error: row?.message || 'Error', success: false }
}

export const removeUserAsAdmin = async (userId: string): Promise<{ error: string | null; success: boolean }> => {
  const { data, error } = await supabase.rpc('remove_user_as_admin', { p_user_id: userId })
  if (error) return { error: error.message, success: false }
  const row = Array.isArray(data) ? data[0] : data
  if (row?.success) return { error: null, success: true }
  return { error: row?.message || 'Error', success: false }
}

export const getSemiAdminUserIds = async (): Promise<string[]> => {
  const { data, error } = await supabase.rpc('get_semi_admin_user_ids')
  if (error) return []
  const rows = Array.isArray(data) ? data : []
  return rows.map((row: { user_id: string }) => row.user_id)
}

export const addUserAsSemiAdmin = async (userId: string): Promise<{ error: string | null; success: boolean }> => {
  const { data, error } = await supabase.rpc('add_user_as_semi_admin', { p_user_id: userId })
  if (error) return { error: error.message, success: false }
  const row = Array.isArray(data) ? data[0] : data
  if (row?.success) return { error: null, success: true }
  return { error: row?.message || 'Error', success: false }
}

export const removeUserAsSemiAdmin = async (userId: string): Promise<{ error: string | null; success: boolean }> => {
  const { data, error } = await supabase.rpc('remove_user_as_semi_admin', { p_user_id: userId })
  if (error) return { error: error.message, success: false }
  const row = Array.isArray(data) ? data[0] : data
  if (row?.success) return { error: null, success: true }
  return { error: row?.message || 'Error', success: false }
}
