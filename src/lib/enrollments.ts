import { supabase } from './supabase'
import type { Enrollment } from '../types/course'

export const getMyEnrollments = async (): Promise<Enrollment[]> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching enrollments:', error)
    return []
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    accessCode: row.access_code,
    expiresAt: row.expires_at,
    status: row.status,
    createdAt: row.created_at
  }))
}

export const getEnrollmentForCourse = async (courseId: string): Promise<Enrollment | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  if (error || !data) return null

  const exp = new Date(data.expires_at)
  const isExpired = exp.getTime() < Date.now() || data.status === 'expired'
  if (isExpired) return null

  return {
    id: data.id,
    userId: data.user_id,
    courseId: data.course_id,
    accessCode: data.access_code,
    expiresAt: data.expires_at,
    status: data.status,
    createdAt: data.created_at
  }
}

/** Validate access code and return enrollment if valid. Student uses this to "unlock" course. */
export const validateAccessCode = async (
  courseId: string,
  accessCode: string
): Promise<{ error: string | null; enrollment: Enrollment | null }> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in.', enrollment: null }

  const code = accessCode.trim().toUpperCase()
  if (!code) return { error: 'Please enter your access code.', enrollment: null }

  const { data, error } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('course_id', courseId)
    .eq('user_id', user.id)
    .eq('access_code', code)
    .maybeSingle()

  if (error) return { error: 'Could not verify code.', enrollment: null }
  if (!data) return { error: 'Invalid or expired access code.', enrollment: null }

  const exp = new Date(data.expires_at)
  if (exp.getTime() < Date.now()) return { error: 'This access code has expired.', enrollment: null }
  if (data.status === 'expired') return { error: 'This access code has expired.', enrollment: null }

  return {
    error: null,
    enrollment: {
      id: data.id,
      userId: data.user_id,
      courseId: data.course_id,
      accessCode: data.access_code,
      expiresAt: data.expires_at,
      status: data.status,
      createdAt: data.created_at
    }
    }
}

/** Admin/semi-admin: list all enrollment access codes (to copy and share with students). */
export interface EnrollmentAccessCodeRow {
  enrollment_id: string
  user_email: string | null
  course_title: string | null
  access_code: string
  expires_at: string
  status: string
  created_at: string
}

export const getEnrollmentAccessCodes = async (): Promise<{
  error: unknown
  data: EnrollmentAccessCodeRow[] | null
}> => {
  const { data, error } = await supabase.rpc('get_enrollment_access_codes')
  if (error) return { error, data: null }
  const rows = (Array.isArray(data) ? data : []) as EnrollmentAccessCodeRow[]
  return { error: null, data: rows }
}

/** Admin: create enrollment and get generated access code (valid 3 months). */
export const createEnrollmentWithCode = async (
  userId: string,
  courseId: string
): Promise<{ error: any; accessCode: string | null; expiresAt: string | null }> => {
  const { data, error } = await supabase.rpc('create_enrollment_with_code', {
    p_user_id: userId,
    p_course_id: courseId
  })

  if (error) return { error, accessCode: null, expiresAt: null }
  const row = Array.isArray(data) ? data[0] : data
  if (!row) return { error: new Error('No result'), accessCode: null, expiresAt: null }
  return {
    error: null,
    accessCode: row.access_code ?? null,
    expiresAt: row.expires_at ?? null
  }
}
