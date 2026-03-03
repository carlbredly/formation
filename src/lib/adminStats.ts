import { supabase } from './supabase'

export interface SaleByCourse {
  course_id: string
  course_title: string
  count: number
}

export interface PromoCodeStat {
  code: string
  affiliate_email: string | null
  uses: number
  earned: number
}

export interface AdminDashboardStats {
  totalCoursesSold: number
  totalRevenue: number
  totalCommission: number
  netRevenue: number
  salesByCourse: SaleByCourse[]
  promoCodes: PromoCodeStat[]
}

export type AdminStatsResult =
  | { data: AdminDashboardStats; error: null }
  | { data: null; error: string }

export const getAdminDashboardStats = async (): Promise<AdminStatsResult> => {
  const { data, error } = await supabase.rpc('get_admin_dashboard_stats')
  if (error) {
    console.error('Error fetching admin stats:', error)
    const msg =
      error.code === 'PGRST202' || error.message?.includes('function')
        ? 'SQL function missing. Run supabase-admin-stats-rpc.sql in the Supabase SQL editor.'
        : error.message || 'Error loading stats.'
    return { data: null, error: msg }
  }
  const row = Array.isArray(data) ? data[0] : data
  if (!row) {
    return {
      data: null,
      error:
        'Access denied. Add your user to the admin_users table (SQL editor: INSERT INTO admin_users (user_id) SELECT id FROM auth.users WHERE email = \'your@email.com\' ON CONFLICT DO NOTHING;).'
    }
  }

  const rawSales = row.sales_by_course
  const salesArr = Array.isArray(rawSales) ? rawSales : rawSales ? Object.values(rawSales) : []
  const salesByCourse: SaleByCourse[] = salesArr.map((s: any) => ({
    course_id: s?.course_id ?? '',
    course_title: s?.course_title || '',
    count: Number(s?.count) || 0
  }))

  const rawCodes = row.promo_codes
  const codesArr = Array.isArray(rawCodes) ? rawCodes : rawCodes ? Object.values(rawCodes) : []
  const promoCodes: PromoCodeStat[] = codesArr.map((p: any) => ({
    code: p?.code || '',
    affiliate_email: p?.affiliate_email ?? null,
    uses: Number(p?.uses) || 0,
    earned: Number(p?.earned) || 0
  }))

  return {
    data: {
      totalCoursesSold: Number(row.total_courses_sold) || 0,
      totalRevenue: Number(row.total_revenue) || 0,
      totalCommission: Number(row.total_commission) || 0,
      netRevenue: Number(row.net_revenue) || 0,
      salesByCourse,
      promoCodes
    },
    error: null
  }
}
