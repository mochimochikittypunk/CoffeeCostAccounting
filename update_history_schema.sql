-- Create inventory_history table
create table if not exists inventory_history (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users not null,
    inventory_item_id uuid references inventory(id) on delete set null,
    item_name text not null,
    type text not null, 
    amount_delta float8 not null default 0,
    created_at timestamptz default now()
);

-- Enable RLS
alter table inventory_history enable row level security;

-- Policies
create policy "Users can view their own history"
    on inventory_history for select
    using (auth.uid() = user_id);

create policy "Users can insert their own history"
    on inventory_history for insert
    with check (auth.uid() = user_id);

-- Create index for performance
create index if not exists inventory_history_user_id_idx on inventory_history(user_id);
create index if not exists inventory_history_created_at_idx on inventory_history(created_at desc);
