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
    price: course.price != null ? Number(course.price) : 0,
    thumbnail: course.thumbnail || undefined
  }))
}

export const addCourse = async (course: Omit<Course, 'id'>): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('courses')
    .insert({
      title: course.title,
      price: course.price ?? 0,
      thumbnail: course.thumbnail || null
    })

  return { error }
}

export const updateCourse = async (id: string, course: Omit<Course, 'id'>): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('courses')
    .update({
      title: course.title,
      price: course.price ?? 0,
      thumbnail: course.thumbnail || null
    })
    .eq('id', id)

  return { error }
}

export const deleteCourse = async (id: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)

  return { error }
}

