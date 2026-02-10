-- Fix RLS Policies for Profiles Table
-- Run this in Supabase SQL Editor

-- 1. Allow users to UPDATE their own profile
-- This is necessary for saving account settings (display_name, shop_name, etc.)
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING ( (select auth.jwt() ->> 'sub') = user_id )
WITH CHECK ( (select auth.jwt() ->> 'sub') = user_id );

-- 2. Allow users to INSERT (create) their own profile
-- (Usually handled by initialize function, but good as fallback)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK ( (select auth.jwt() ->> 'sub') = user_id );

-- 3. Verify current policies (just for checking)
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
