// Liste des emails admin
// Vous pouvez modifier cette liste pour ajouter/supprimer des admins
// Pour plus de sécurité, vous pouvez déplacer cette liste dans un fichier .env
const ADMIN_EMAILS = [
  'carlbredlyrefuse@gmail.com',
  // Ajoutez ici les emails des administrateurs
  // Exemple : 'votre-email@example.com',
]

export const checkAdminFromMetadata = (user: any): boolean => {
  if (!user || !user.email) {
    return false
  }

  // Vérifier d'abord les user_metadata (si vous avez défini le rôle via Supabase)
  if (user?.user_metadata?.role === 'admin') {
    return true
  }
  
  // Vérifier la liste d'emails admin
  if (ADMIN_EMAILS.includes(user.email)) {
    return true
  }
  
  return false
}

