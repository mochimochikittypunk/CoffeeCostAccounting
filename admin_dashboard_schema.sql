-- Admin Dashboard Schema Extension
-- Run this in Supabase SQL Editor

-- 1. Extend profiles table with access tracking and email
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS access_count int DEFAULT 0,
ADD COLUMN IF NOT EXISTS email text;

-- 2. Create feature_usage table for tracking which features users use
CREATE TABLE IF NOT EXISTS feature_usage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  feature_name text NOT NULL, -- 'single_origin' | 'blend' | 'set' | 'inventory'
  used_at timestamptz DEFAULT now()
);

-- 3. Enable RLS on feature_usage
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can insert their own usage logs
CREATE POLICY "Users can insert own usage logs"
ON feature_usage FOR INSERT
WITH CHECK ((SELECT auth.jwt() ->> 'sub') = user_id);

-- RLS Policy: Users can view their own usage (for future self-analytics)
CREATE POLICY "Users can view own usage"
ON feature_usage FOR SELECT
USING ((SELECT auth.jwt() ->> 'sub') = user_id);

-- 4. Update the initialize_user_with_credits function to track access count and email
CREATE OR REPLACE FUNCTION initialize_user_with_credits()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_user_id text;
  auth_email text;
  profile_data json;
BEGIN
  -- Get User ID and Email from Clerk Token
  auth_user_id := (SELECT auth.jwt() ->> 'sub');
  auth_email := (SELECT auth.jwt() ->> 'email');
  
  IF auth_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if profile exists
  SELECT row_to_json(p) INTO profile_data FROM profiles p WHERE user_id = auth_user_id;

  IF profile_data IS NOT NULL THEN
    -- Profile exists: increment access count and update email
    UPDATE profiles 
    SET access_count = COALESCE(access_count, 0) + 1,
        email = COALESCE(auth_email, email)
    WHERE user_id = auth_user_id;
    
    -- Return updated profile
    SELECT row_to_json(p) INTO profile_data FROM profiles p WHERE user_id = auth_user_id;
    RETURN profile_data;
  END IF;

  -- Create new profile with initial values
  INSERT INTO profiles (user_id, credits, access_count, email)
  VALUES (auth_user_id, 100, 1, auth_email)
  RETURNING row_to_json(profiles) INTO profile_data;

  RETURN profile_data;
END;
$$;

-- 5. Function to get all profiles (Admin only - called with service_role key)
CREATE OR REPLACE FUNCTION get_all_profiles()
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM profiles ORDER BY last_active_at DESC NULLS LAST;
$$;

-- 6. Function to get feature usage stats
CREATE OR REPLACE FUNCTION get_feature_usage_stats()
RETURNS TABLE (feature_name text, usage_count bigint)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT feature_name, COUNT(*) as usage_count
  FROM feature_usage
  GROUP BY feature_name
  ORDER BY usage_count DESC;
$$;
