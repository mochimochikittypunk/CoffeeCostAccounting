-- Survey Ratings Schema
-- Run this in Supabase SQL Editor

-- 1. Create survey_ratings table
CREATE TABLE IF NOT EXISTS survey_ratings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE survey_ratings ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policy: Users can insert their own ratings
CREATE POLICY "Users can insert own ratings"
ON survey_ratings FOR INSERT
WITH CHECK ((SELECT auth.jwt() ->> 'sub') = user_id);

-- 4. RLS Policy: Users can view their own ratings
CREATE POLICY "Users can view own ratings"
ON survey_ratings FOR SELECT
USING ((SELECT auth.jwt() ->> 'sub') = user_id);

-- 5. Add latest_rating column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS latest_rating int CHECK (latest_rating >= 1 AND latest_rating <= 5);
