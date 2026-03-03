import { supabase } from './supabase'
import type { Lesson } from '../types/course'

export const getLessonsByCourseId = async (courseId: string): Promise<Lesson[]> => {
  const { data, error } = await supabase
    .from('course_lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('position', { ascending: true })

  if (error) {
    console.error('Error fetching lessons:', error)
    return []
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description || undefined,
    youtubeVideoId: row.youtube_video_id || undefined,
    videoUrl: row.video_url || undefined,
    contentUrl: row.content_url || undefined,
    resources: row.resources || [],
    position: row.position ?? 0,
    createdAt: row.created_at
  }))
}

export const addLesson = async (lesson: {
  courseId: string
  title: string
  description?: string
  youtubeVideoId?: string
  videoUrl?: string
  contentUrl?: string
  resources?: { id: string; title: string; url: string }[]
  position?: number
}): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('course_lessons')
    .insert({
      course_id: lesson.courseId,
      title: lesson.title,
      description: lesson.description || null,
      youtube_video_id: lesson.youtubeVideoId || null,
      video_url: lesson.videoUrl || null,
      content_url: lesson.contentUrl || null,
      resources: lesson.resources || [],
      position: lesson.position ?? 0
    })
  return { error }
}

export const updateLesson = async (
  id: string,
  lesson: {
    title?: string
    description?: string
    youtubeVideoId?: string
    videoUrl?: string
    contentUrl?: string
    resources?: { id: string; title: string; url: string }[]
    position?: number
  }
): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('course_lessons')
    .update({
      ...(lesson.title != null && { title: lesson.title }),
      ...(lesson.description != null && { description: lesson.description }),
      ...(lesson.youtubeVideoId != null && { youtube_video_id: lesson.youtubeVideoId }),
      ...(lesson.videoUrl != null && { video_url: lesson.videoUrl }),
      ...(lesson.contentUrl != null && { content_url: lesson.contentUrl }),
      ...(lesson.resources != null && { resources: lesson.resources }),
      ...(lesson.position != null && { position: lesson.position })
    })
    .eq('id', id)
  return { error }
}

export const deleteLesson = async (id: string): Promise<{ error: any }> => {
  const { error } = await supabase.from('course_lessons').delete().eq('id', id)
  return { error }
}
