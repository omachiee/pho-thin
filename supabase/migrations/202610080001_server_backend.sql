-- Apply to the existing coursework schema without deleting tables or records.
BEGIN;

ALTER TABLE public.reservations ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.inquiries ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.security_logs ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
-- Legacy PIN values are not an authentication mechanism; the app uses Supabase Auth only.
ALTER TABLE public.admin_profiles ALTER COLUMN pin_code DROP DEFAULT;
ALTER TABLE public.admin_profiles ALTER COLUMN role SET DEFAULT 'staff';

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 120),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 9 AND 25),
  branch_id text NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  branch_name text NOT NULL,
  pickup_at timestamptz NOT NULL,
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 2000),
  total bigint NOT NULL DEFAULT 0 CHECK (total BETWEEN 0 AND 10000000000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  dish_id text NOT NULL REFERENCES public.dishes(id) ON DELETE RESTRICT,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  unit_price integer NOT NULL CHECK (unit_price BETWEEN 0 AND 10000000),
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 50),
  UNIQUE (order_id, dish_id)
);

-- NOT VALID preserves legacy rows, while enforcing checks on all new/updated rows.
ALTER TABLE public.dishes DROP CONSTRAINT IF EXISTS dishes_integer_vnd;
ALTER TABLE public.dishes ADD CONSTRAINT dishes_integer_vnd CHECK (price >= 0 AND price <= 10000000 AND price = trunc(price)) NOT VALID;
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_input_bounds;
ALTER TABLE public.reservations ADD CONSTRAINT reservations_input_bounds CHECK (
  char_length(full_name) BETWEEN 1 AND 120 AND char_length(phone) BETWEEN 9 AND 25
  AND party_size BETWEEN 1 AND 50 AND char_length(coalesce(notes, '')) <= 2000
  AND char_length(coalesce(email, '')) <= 254
  AND reservation_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
) NOT VALID;
ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_input_bounds;
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_input_bounds CHECK (
  char_length(full_name) BETWEEN 1 AND 120 AND char_length(phone) BETWEEN 9 AND 25
  AND char_length(coalesce(email, '')) <= 254 AND char_length(coalesce(position, '')) <= 200
  AND char_length(coalesce(message, '')) BETWEEN 1 AND 5000
  AND (type <> 'recruitment' OR char_length(coalesce(position, '')) > 0)
) NOT VALID;
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_branch_id_fkey;
ALTER TABLE public.reservations ADD CONSTRAINT reservations_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE RESTRICT NOT VALID;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = (SELECT auth.uid()) AND role IN ('superadmin', 'admin', 'manager')
  );
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.prepare_reservation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE selected_name text; requested_at timestamptz;
BEGIN
  SELECT name->>'vi' INTO selected_name FROM public.branches WHERE id = NEW.branch_id FOR SHARE;
  IF selected_name IS NULL OR selected_name = '' THEN
    RAISE EXCEPTION 'Invalid branch' USING ERRCODE = '22023';
  END IF;
  IF NEW.reservation_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN
    RAISE EXCEPTION 'Invalid reservation time' USING ERRCODE = '22023';
  END IF;
  requested_at := (NEW.reservation_date + NEW.reservation_time::time) AT TIME ZONE 'Asia/Ho_Chi_Minh';
  IF requested_at > now() + interval '90 days'
    OR (coalesce(NEW.is_walk_in, false) AND NEW.reservation_date <> (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date)
    OR (NOT coalesce(NEW.is_walk_in, false) AND requested_at <= now()) THEN
    RAISE EXCEPTION 'Invalid reservation date' USING ERRCODE = '22023';
  END IF;
  NEW.branch_name := selected_name;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.prepare_reservation() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS prepare_reservation ON public.reservations;
CREATE TRIGGER prepare_reservation BEFORE INSERT ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.prepare_reservation();

CREATE OR REPLACE FUNCTION public.check_order_transition()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
    (OLD.status = 'pending' AND NEW.status IN ('confirmed', 'cancelled')) OR
    (OLD.status = 'confirmed' AND NEW.status IN ('completed', 'cancelled'))
  ) THEN
    RAISE EXCEPTION 'Invalid order transition' USING ERRCODE = '22023';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.check_order_transition() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS check_order_transition ON public.orders;
CREATE TRIGGER check_order_transition BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.check_order_transition();

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['dishes', 'articles', 'reservations'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS touch_updated_at ON public.%I', table_name);
    EXECUTE format('CREATE TRIGGER touch_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()', table_name);
  END LOOP;
END;
$$;

-- A single database transaction resolves trusted catalog prices and takes snapshots.
-- ponytail: no payment integration or idempotency tracking for this coursework demo.
CREATE OR REPLACE FUNCTION public.create_order(
  p_full_name text, p_phone text, p_branch_id text, p_pickup_at text, p_notes text, p_items jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  new_order_id uuid;
  selected_branch text;
  pickup timestamptz;
  entry jsonb;
  selected_dish public.dishes%ROWTYPE;
  item_quantity integer;
  order_total bigint := 0;
  result jsonb;
BEGIN
  IF p_full_name IS NULL OR char_length(btrim(p_full_name)) NOT BETWEEN 1 AND 120
    OR p_phone IS NULL OR char_length(p_phone) NOT BETWEEN 9 AND 25
    OR p_phone !~ '^\+?[0-9 ()-]+$'
    OR char_length(regexp_replace(p_phone, '[^0-9]', '', 'g')) NOT BETWEEN 9 AND 15
    OR p_branch_id IS NULL OR char_length(p_branch_id) NOT BETWEEN 1 AND 100
    OR char_length(coalesce(p_notes, '')) > 2000 THEN
    RAISE EXCEPTION 'Invalid order details' USING ERRCODE = '22023';
  END IF;
  IF p_pickup_at IS NULL OR p_pickup_at !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$' THEN
    RAISE EXCEPTION 'Pickup requires ISO timezone' USING ERRCODE = '22023';
  END IF;
  BEGIN pickup := p_pickup_at::timestamptz;
  EXCEPTION WHEN invalid_datetime_format OR datetime_field_overflow THEN
    RAISE EXCEPTION 'Invalid pickup time' USING ERRCODE = '22023';
  END;
  IF pickup <= now() OR pickup > now() + interval '90 days' THEN
    RAISE EXCEPTION 'Pickup must be in the future' USING ERRCODE = '22023';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'Invalid cart' USING ERRCODE = '22023';
  END IF;
  IF jsonb_array_length(p_items) NOT BETWEEN 1 AND 20 THEN
    RAISE EXCEPTION 'Invalid cart size' USING ERRCODE = '22023';
  END IF;
  SELECT name->>'vi' INTO selected_branch FROM public.branches WHERE id = p_branch_id FOR SHARE;
  IF selected_branch IS NULL OR selected_branch = '' THEN
    RAISE EXCEPTION 'Invalid branch' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.orders (full_name, phone, branch_id, branch_name, pickup_at, notes)
    VALUES (btrim(p_full_name), p_phone, p_branch_id, selected_branch, pickup, coalesce(p_notes, '')) RETURNING id INTO new_order_id;
  FOR entry IN SELECT value FROM jsonb_array_elements(p_items) ORDER BY value->>'dish_id' LOOP
    IF jsonb_typeof(entry) <> 'object' OR jsonb_typeof(entry->'dish_id') IS DISTINCT FROM 'string'
      OR char_length(entry->>'dish_id') NOT BETWEEN 1 AND 100
      OR jsonb_typeof(entry->'quantity') IS DISTINCT FROM 'number'
      OR (entry->>'quantity') !~ '^[0-9]{1,2}$'
      OR EXISTS (SELECT 1 FROM jsonb_object_keys(entry) AS keys(key) WHERE key NOT IN ('dish_id', 'quantity')) THEN
      RAISE EXCEPTION 'Invalid cart item' USING ERRCODE = '22023';
    END IF;
    item_quantity := (entry->>'quantity')::integer;
    IF item_quantity NOT BETWEEN 1 AND 50 THEN
      RAISE EXCEPTION 'Invalid quantity' USING ERRCODE = '22023';
    END IF;
    SELECT * INTO selected_dish FROM public.dishes WHERE id = entry->>'dish_id' FOR SHARE;
    IF NOT FOUND OR selected_dish.is_available IS DISTINCT FROM true
      OR selected_dish.price < 0 OR selected_dish.price > 10000000 OR selected_dish.price <> trunc(selected_dish.price)
      OR coalesce(selected_dish.name->>'vi', '') = '' OR char_length(selected_dish.name->>'vi') > 200 THEN
      RAISE EXCEPTION 'Dish unavailable or invalid price' USING ERRCODE = '22023';
    END IF;
    IF EXISTS (SELECT 1 FROM public.order_items WHERE order_items.order_id = new_order_id AND dish_id = selected_dish.id) THEN
      RAISE EXCEPTION 'Duplicate dish' USING ERRCODE = '22023';
    END IF;
    INSERT INTO public.order_items (order_id, dish_id, name, unit_price, quantity)
      VALUES (new_order_id, selected_dish.id, selected_dish.name->>'vi', selected_dish.price::integer, item_quantity);
    order_total := order_total + selected_dish.price::bigint * item_quantity;
  END LOOP;
  UPDATE public.orders SET total = order_total WHERE id = new_order_id;
  SELECT to_jsonb(o) || jsonb_build_object('order_items', (
    SELECT jsonb_agg(to_jsonb(i) ORDER BY i.dish_id) FROM public.order_items i WHERE i.order_id = o.id
  )) INTO result FROM public.orders o WHERE o.id = new_order_id;
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.create_order(text, text, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order(text, text, text, text, text, jsonb) TO service_role;

-- Remove EVERY legacy policy on these app-owned tables: permissive policies are ORed.
DO $$
DECLARE policy_record record; table_name text;
BEGIN
  FOR policy_record IN SELECT schemaname, tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('dishes', 'branches', 'articles', 'reservations', 'inquiries', 'security_logs', 'admin_profiles', 'orders', 'order_items') LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
  END LOOP;
  FOREACH table_name IN ARRAY ARRAY['dishes', 'branches', 'articles', 'reservations', 'inquiries', 'security_logs', 'admin_profiles', 'orders', 'order_items'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon, authenticated', table_name);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', table_name);
  END LOOP;
END;
$$;

GRANT SELECT ON public.dishes, public.branches, public.articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.dishes, public.branches, public.articles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT SELECT, UPDATE ON public.inquiries TO authenticated;
GRANT SELECT ON public.orders, public.order_items, public.security_logs, public.admin_profiles TO authenticated;
GRANT UPDATE (status) ON public.orders TO authenticated;

CREATE POLICY catalog_read ON public.dishes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY catalog_read ON public.branches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY catalog_read ON public.articles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY admin_manage ON public.dishes FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY admin_manage ON public.branches FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY admin_manage ON public.articles FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY admin_manage ON public.reservations FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY admin_read ON public.inquiries FOR SELECT TO authenticated USING ((SELECT public.is_admin()));
CREATE POLICY admin_update ON public.inquiries FOR UPDATE TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY admin_read ON public.orders FOR SELECT TO authenticated USING ((SELECT public.is_admin()));
CREATE POLICY admin_update ON public.orders FOR UPDATE TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY admin_read ON public.order_items FOR SELECT TO authenticated USING ((SELECT public.is_admin()));
CREATE POLICY admin_read ON public.security_logs FOR SELECT TO authenticated USING ((SELECT public.is_admin()));
CREATE POLICY profile_self_read ON public.admin_profiles FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));

INSERT INTO storage.buckets (id, name, public) VALUES ('pho-thin-assets', 'pho-thin-assets', true) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Public can view pho-thin-assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to pho-thin-assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update objects in pho-thin-assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete objects in pho-thin-assets" ON storage.objects;
DROP POLICY IF EXISTS pho_assets_read ON storage.objects;
DROP POLICY IF EXISTS pho_assets_insert ON storage.objects;
DROP POLICY IF EXISTS pho_assets_update ON storage.objects;
DROP POLICY IF EXISTS pho_assets_delete ON storage.objects;
CREATE POLICY pho_assets_read ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'pho-thin-assets');
CREATE POLICY pho_assets_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'pho-thin-assets' AND (SELECT public.is_admin()));
CREATE POLICY pho_assets_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'pho-thin-assets' AND (SELECT public.is_admin())) WITH CHECK (bucket_id = 'pho-thin-assets' AND (SELECT public.is_admin()));
CREATE POLICY pho_assets_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'pho-thin-assets' AND (SELECT public.is_admin()));

COMMIT;
