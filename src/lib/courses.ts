import { supabase } from './supabase'
import type { Course } from '../types/course'

export const getCourses = async (): Promise<Course[]> => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching courses:', error)
    return []
  }

  return data.map((course: any) => ({
    id: course.id,
    title: course.title,
    description: course.description || undefined,
    youtubeVideoId: course.youtube_video_id,
    resources: course.resources || []
  }))
}

export const addCourse = async (course: Omit<Course, 'id'>): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('courses')
    .insert({
      title: course.title,
      description: course.description || null,
      youtube_video_id: course.youtubeVideoId,
      resources: course.resources || []
    })

  return { error }
}

export const deleteCourse = async (id: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)

  return { error }
}

