import { supabaseUrl } from './supabase'

const THUMBNAIL_BUCKET = 'course-thumbnails'

/**
 * Retourne l’URL complète à utiliser pour afficher la miniature d’un cours.
 * - Si thumbnail commence par http:// ou https:// → utilisée telle quelle.
 * - Sinon (chemin Supabase Storage) → URL publique Supabase construite.
 */
export function getCourseThumbnailUrl(thumbnail: string | undefined | null): string | undefined {
  if (!thumbnail || !thumbnail.trim()) return undefined
  const t = thumbnail.trim()
  if (t.startsWith('http://') || t.startsWith('https://')) return t
  const path = t.startsWith('/') ? t.slice(1) : t
  return `${supabaseUrl}/storage/v1/object/public/${THUMBNAIL_BUCKET}/${path}`
}
