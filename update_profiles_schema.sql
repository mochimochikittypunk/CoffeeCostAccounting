-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS shop_name text,
ADD COLUMN IF NOT EXISTS roaster_machine text,
ADD COLUMN IF NOT EXISTS roaster_size text,
ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now();

-- Create a trigger function to update updated_at on change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
