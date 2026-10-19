ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS pre_ordered_items jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS pre_order_total bigint DEFAULT 0;
