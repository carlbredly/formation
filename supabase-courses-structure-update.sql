-- Update course: only Title, Price, Thumbnail (miniature)
-- Lessons: Title, Description, YouTube video ID, Resources

-- 1) Courses: add thumbnail, make youtube_video_id and resources optional
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'thumbnail') THEN
    ALTER TABLE courses ADD COLUMN thumbnail TEXT;
  END IF;
END $$;

ALTER TABLE courses ALTER COLUMN youtube_video_id DROP NOT NULL;
ALTER TABLE courses ALTER COLUMN youtube_video_id SET DEFAULT NULL;

-- 2) Course lessons: add description, youtube_video_id, resources
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'course_lessons' AND column_name = 'description') THEN
    ALTER TABLE course_lessons ADD COLUMN description TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'course_lessons' AND column_name = 'youtube_video_id') THEN
    ALTER TABLE course_lessons ADD COLUMN youtube_video_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'course_lessons' AND column_name = 'resources') THEN
    ALTER TABLE course_lessons ADD COLUMN resources JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;
