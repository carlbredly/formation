-- Script SQL pour créer la table des cours dans Supabase
-- Exécutez ce script dans l'éditeur SQL de Supabase (SQL Editor)

-- Créer la table courses
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  youtube_video_id TEXT NOT NULL,
  resources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Créer un index sur created_at pour améliorer les performances
CREATE INDEX IF NOT EXISTS courses_created_at_idx ON courses(created_at DESC);

-- Activer Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Les utilisateurs authentifiés peuvent lire les cours"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

-- Politique pour permettre l'insertion aux utilisateurs authentifiés
-- (Vous pouvez restreindre cela à certains utilisateurs si nécessaire)
CREATE POLICY "Les utilisateurs authentifiés peuvent créer des cours"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Politique pour permettre la mise à jour aux utilisateurs authentifiés
CREATE POLICY "Les utilisateurs authentifiés peuvent mettre à jour les cours"
  ON courses FOR UPDATE
  TO authenticated
  USING (true);

-- Politique pour permettre la suppression aux utilisateurs authentifiés
CREATE POLICY "Les utilisateurs authentifiés peuvent supprimer les cours"
  ON courses FOR DELETE
  TO authenticated
  USING (true);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

