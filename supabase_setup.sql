-- 1. Create Inventory Table
create table if not exists inventory (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- Links to Clerk User ID
  name text not null,
  stock_weight_kg float8 default 0,
  cost_price_per_kg float8 default 0,
  description text,
  is_public boolean default false, -- For future marketplace features
  composition jsonb, -- For blend recipes
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable Row Level Security (RLS)
alter table inventory enable row level security;

-- 3. Create RLS Policy
-- This policy ensures users can ONLY see and edit rows where `user_id` matches their own ID.
-- The `request.jwt.claim.sub` comes from the Clerk token.
create policy "Users can manage their own inventory"
on inventory
for all
using ( 
  request.jwt.claim.sub() = user_id 
)
with check ( 
  request.jwt.claim.sub() = user_id 
);

-- 4. Create Helper Function (Optional but safe)
-- Sometimes direct claim access syntax changes; using a auth.uid() function wrapper is common pattern in Supabase Auth,
-- but for custom JWTs (Clerk), checking the claim directly is robust.
-- If the above policy gives an error, try this simple version:
-- using ( (select auth.jwt() ->> 'sub') = user_id )
