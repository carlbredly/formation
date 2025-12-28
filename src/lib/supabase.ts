import { createClient } from '@supabase/supabase-js'

// Remplacez ces valeurs par vos propres clés Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables d\'environnement Supabase manquantes. ' +
    'Veuillez créer un fichier .env à la racine du projet avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY. ' +
    'Voir SETUP.md pour plus d\'informations.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
