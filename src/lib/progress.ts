import { supabase } from './supabase'
import type { CourseProgress } from '../types/course'

export const getProgressForEnrollment = async (
  enrollmentId: string
): Promise<CourseProgress[]> => {
  const { data, error } = await supabase
    .from('course_progress')
    .select('*')
    .eq('enrollment_id', enrollmentId)

  if (error) {
    console.error('Error fetching progress:', error)
    return []
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    enrollmentId: row.enrollment_id,
    lessonId: row.lesson_id,
    completed: row.completed === true,
    completedAt: row.completed_at
  }))
}

export const setLessonCompleted = async (
  enrollmentId: string,
  lessonId: string,
  completed: boolean
): Promise<{ error: any }> => {
  if (completed) {
    const { error } = await supabase
      .from('course_progress')
      .upsert(
        {
          enrollment_id: enrollmentId,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString()
        },
        { onConflict: 'enrollment_id,lesson_id' }
      )
    return { error }
  } else {
    const { error } = await supabase
      .from('course_progress')
      .update({ completed: false, completed_at: null })
      .eq('enrollment_id', enrollmentId)
      .eq('lesson_id', lessonId)
    return { error }
  }
}
