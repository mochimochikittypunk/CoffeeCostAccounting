-- 1. Create Profiles Table
create table if not exists profiles (
  id uuid default gen_random_uuid() primary key,
  user_id text not null unique, -- Clerk User ID
  credits int default 100, -- Initial credits
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable RLS
alter table profiles enable row level security;

-- 3. RLS Policies
-- User can SEE their own profile
create policy "Users can view own profile"
on profiles for select
using ( (select auth.jwt() ->> 'sub') = user_id );

-- User can NOT update credits directly (only via secure functions in future)
-- create policy "Users can update own profile" ... (Omitted for safety)

-- 4. Initializer Function (Security Definer = Run as Admin)
-- This function checks if profile exists, if not creates it with 100 credits.
create or replace function initialize_user_with_credits()
returns json
language plpgsql
security definer
as $$
declare
  auth_user_id text;
  profile_data json;
begin
  -- Get User ID from Clerk Token
  auth_user_id := (select auth.jwt() ->> 'sub');
  
  if auth_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Check if profile exists
  select row_to_json(p) into profile_data from profiles p where user_id = auth_user_id;

  if profile_data is not null then
    return profile_data;
  end if;

  -- Create new profile
  insert into profiles (user_id, credits)
  values (auth_user_id, 100)
  returning row_to_json(profiles) into profile_data;

  return profile_data;
end;
$$;
