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

/** Limited stats for semi-admin (no revenue, commission, or promo codes). */
export interface EnrollmentsByCourseRow {
  course_id: string
  course_title: string
  count: number
}

export interface SemiAdminDashboardStats {
  totalActiveEnrollments: number
  totalPendingPayments: number
  enrollmentsByCourse: EnrollmentsByCourseRow[]
}

export type SemiAdminStatsResult =
  | { data: SemiAdminDashboardStats; error: null }
  | { data: null; error: string }

export const getSemiAdminDashboardStats = async (): Promise<SemiAdminStatsResult> => {
  const { data, error } = await supabase.rpc('get_semi_admin_dashboard_stats')
  if (error) {
    console.error('Error fetching semi-admin stats:', error)
    return {
      data: null,
      error: error.message || 'Error loading statistics.'
    }
  }
  const row = Array.isArray(data) ? data[0] : data
  if (!row) {
    return { data: null, error: 'Access denied or no data.' }
  }
  const rawByCourse = row.enrollments_by_course
  const arr = Array.isArray(rawByCourse) ? rawByCourse : rawByCourse ? Object.values(rawByCourse) : []
  const enrollmentsByCourse: EnrollmentsByCourseRow[] = arr.map((x: any) => ({
    course_id: x?.course_id ?? '',
    course_title: x?.course_title ?? '',
    count: Number(x?.count) || 0
  }))
  return {
    data: {
      totalActiveEnrollments: Number(row.total_active_enrollments) || 0,
      totalPendingPayments: Number(row.total_pending_payments) || 0,
      enrollmentsByCourse
    },
    error: null
  }
}

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
        'Access denied. Full admin: run supabase-add-admin-user.sql. Dashboard + stats only (semi-admin): run supabase-add-semi-admin-user.sql. Replace the email and run in the Supabase SQL Editor.'
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
