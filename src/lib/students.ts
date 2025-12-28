import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

export interface Student {
  id: string
  email: string
  created_at: string
}

// Créer un client admin avec la clé service_role
// ATTENTION: Cette clé ne doit JAMAIS être exposée côté client en production
// Utilisez plutôt une Edge Function Supabase pour sécuriser cela
const getAdminClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'VITE_SUPABASE_SERVICE_ROLE_KEY est requise pour gérer les étudiants. ' +
      'Ajoutez-la dans votre fichier .env (ATTENTION: Ne la commitez JAMAIS dans Git)'
    )
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export const getStudents = async (): Promise<Student[]> => {
  try {
    const adminClient = getAdminClient()
    const { data, error } = await adminClient.auth.admin.listUsers()

    if (error) {
      console.error('Error fetching students:', error)
      return []
    }

    return data.users.map((user: User) => ({
      id: user.id,
      email: user.email || '',
      created_at: user.created_at
    }))
  } catch (error: any) {
    console.error('Error in getStudents:', error)
    return []
  }
}

export const addStudent = async (email: string, password: string): Promise<{ error: any }> => {
  try {
    const adminClient = getAdminClient()
    const { error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    return { error }
  } catch (error: any) {
    return { error }
  }
}

export const deleteStudent = async (id: string): Promise<{ error: any }> => {
  try {
    const adminClient = getAdminClient()
    const { error } = await adminClient.auth.admin.deleteUser(id)
    return { error }
  } catch (error: any) {
    return { error }
  }
}

