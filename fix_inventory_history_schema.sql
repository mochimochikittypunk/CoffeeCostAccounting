-- Fix inventory_history table: user_id type mismatch
-- Problem: inventory table uses `user_id text` (Clerk User ID),
--          but inventory_history uses `user_id uuid references auth.users`.
--          Both apps pass Clerk's string user_id, causing silent insert failures.

-- Step 1: Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own history" ON inventory_history;
DROP POLICY IF EXISTS "Users can insert their own history" ON inventory_history;
DROP POLICY IF EXISTS "Users can delete their own history" ON inventory_history;

-- Step 2: Drop the foreign key constraint and change column type to text
ALTER TABLE inventory_history DROP CONSTRAINT IF EXISTS inventory_history_user_id_fkey;
ALTER TABLE inventory_history ALTER COLUMN user_id TYPE text USING user_id::text;

-- Step 3: Recreate RLS policies using auth.jwt() to extract Clerk's sub claim
CREATE POLICY "Users can view their own history"
    ON inventory_history FOR SELECT
    USING ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can insert their own history"
    ON inventory_history FOR INSERT
    WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can delete their own history"
    ON inventory_history FOR DELETE
    USING ((auth.jwt() ->> 'sub') = user_id);
