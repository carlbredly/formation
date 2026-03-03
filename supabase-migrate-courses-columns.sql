-- Migration : ajouter les colonnes manquantes à la table courses
-- Exécuter dans l’éditeur SQL Supabase si l’erreur "price column not in schema cache" apparaît.

-- 1) Ajouter la colonne price si elle n’existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'price'
  ) THEN
    ALTER TABLE courses ADD COLUMN price NUMERIC(10, 2) DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- 2) Ajouter la colonne thumbnail si elle n’existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'thumbnail'
  ) THEN
    ALTER TABLE courses ADD COLUMN thumbnail TEXT;
  END IF;
END $$;

-- 3) Rendre youtube_video_id nullable (si la table vient de l’ancien script)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'youtube_video_id'
  ) THEN
    ALTER TABLE courses ALTER COLUMN youtube_video_id DROP NOT NULL;
    ALTER TABLE courses ALTER COLUMN youtube_video_id SET DEFAULT NULL;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL; -- ignore si déjà nullable
END $$;
