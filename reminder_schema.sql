-- Reminder Email Schema
-- Run this in Supabase SQL Editor

-- Add reminder tracking column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz;
