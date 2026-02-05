-- Add retail_price and wholesale_price to inventory table
alter table inventory 
add column if not exists retail_price float8 default 0,
add column if not exists wholesale_price float8 default 0;
