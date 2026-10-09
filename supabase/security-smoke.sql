-- Non-destructive integration checks: every fixture and role change is rolled back.
BEGIN;
CREATE TEMP TABLE pho_audit_ids ON COMMIT DROP AS
SELECT gen_random_uuid() AS admin_id, gen_random_uuid() AS staff_id,
  gen_random_uuid()::text AS reservation_id, NULL::uuid AS order_id;
GRANT SELECT ON pho_audit_ids TO authenticated;

INSERT INTO auth.users (id, email)
SELECT admin_id, 'audit-admin-' || admin_id::text || '@example.invalid' FROM pho_audit_ids
UNION ALL SELECT staff_id, 'audit-staff-' || staff_id::text || '@example.invalid' FROM pho_audit_ids;
INSERT INTO public.admin_profiles (id, role)
SELECT admin_id, 'admin' FROM pho_audit_ids UNION ALL SELECT staff_id, 'staff' FROM pho_audit_ids;
INSERT INTO public.reservations (id, full_name, phone, reservation_date, reservation_time, party_size, branch_id)
SELECT reservation_id, 'Audit fixture', '0900000000',
  (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date + 1, '11:30', 2, 'cs1-dinh-tien-hoang' FROM pho_audit_ids;

-- Guests can read the public catalog, but cannot inspect private tables or change prices.
SET LOCAL ROLE anon;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.dishes) <> 14 THEN RAISE EXCEPTION 'Catalog seed missing'; END IF;
  BEGIN
    PERFORM id FROM public.reservations LIMIT 1;
    RAISE EXCEPTION 'Guest read private data';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    UPDATE public.dishes SET price = 1 WHERE id = 'pho-tai-chin';
    RAISE EXCEPTION 'Guest changed menu price';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  IF has_function_privilege('anon', 'public.create_order(text,text,text,text,text,jsonb)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Guest has privileged order RPC';
  END IF;
END;
$$;
RESET ROLE;

-- A signed-in staff identity is not a management account and cannot self-promote.
SELECT set_config('request.jwt.claim.sub', staff_id::text, true),
  set_config('request.jwt.claims', json_build_object('sub', staff_id, 'role', 'authenticated')::text, true)
FROM pho_audit_ids;
SET LOCAL ROLE authenticated;
DO $$
BEGIN
  IF public.is_admin() THEN RAISE EXCEPTION 'Staff incorrectly authorized'; END IF;
  IF EXISTS (SELECT 1 FROM public.reservations) THEN RAISE EXCEPTION 'Staff read customer records'; END IF;
  BEGIN
    UPDATE public.admin_profiles SET role = 'admin' WHERE id = auth.uid();
    RAISE EXCEPTION 'Staff self-promoted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  UPDATE public.dishes SET price = 1 WHERE id = 'pho-tai-chin';
  IF FOUND THEN RAISE EXCEPTION 'Staff changed menu'; END IF;
END;
$$;
RESET ROLE;

-- Trusted management identity can read and update permitted fields.
SELECT set_config('request.jwt.claim.sub', admin_id::text, true),
  set_config('request.jwt.claims', json_build_object('sub', admin_id, 'role', 'authenticated')::text, true)
FROM pho_audit_ids;
SET LOCAL ROLE authenticated;
DO $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Admin not authorized'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.reservations WHERE id = (SELECT reservation_id FROM pho_audit_ids)) THEN
    RAISE EXCEPTION 'Admin cannot read reservation';
  END IF;
  UPDATE public.reservations SET status = 'confirmed' WHERE id = (SELECT reservation_id FROM pho_audit_ids);
  IF NOT FOUND THEN RAISE EXCEPTION 'Admin cannot update reservation'; END IF;
END;
$$;
RESET ROLE;

-- Prices come from the catalog; a rejected item rolls back the entire attempted order.
DO $$
DECLARE result jsonb; previous_count bigint; pickup text;
BEGIN
  pickup := to_char((now() + interval '1 day') AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
  result := public.create_order('Audit fixture', '0900000000', 'cs1-dinh-tien-hoang', pickup, '', '[{"dish_id":"pho-tai-chin","quantity":2}]'::jsonb);
  IF (result->>'total')::bigint <> (SELECT price::bigint * 2 FROM public.dishes WHERE id = 'pho-tai-chin') THEN
    RAISE EXCEPTION 'Wrong order total';
  END IF;
  UPDATE pho_audit_ids SET order_id = (result->>'id')::uuid;
  SELECT count(*) INTO previous_count FROM public.orders;
  BEGIN
    PERFORM public.create_order('Audit fixture', '0900000000', 'cs1-dinh-tien-hoang', pickup, '', '[{"dish_id":"pho-tai-chin","quantity":1},{"dish_id":"zz-audit-missing","quantity":1}]'::jsonb);
    RAISE EXCEPTION 'Unknown dish accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  IF (SELECT count(*) FROM public.orders) <> previous_count THEN RAISE EXCEPTION 'Partial order persisted'; END IF;
  BEGIN
    PERFORM public.create_order('Audit fixture', '0900000000', 'cs1-dinh-tien-hoang', pickup, '', '[{"dish_id":"pho-tai-chin","quantity":1,"unit_price":1}]'::jsonb);
    RAISE EXCEPTION 'Caller supplied a price';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
END;
$$;

SET LOCAL ROLE authenticated;
DO $$
BEGIN
  BEGIN
    UPDATE public.orders SET total = 1 WHERE id = (SELECT order_id FROM pho_audit_ids);
    RAISE EXCEPTION 'Admin directly changed order total';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    UPDATE public.orders SET status = 'completed' WHERE id = (SELECT order_id FROM pho_audit_ids);
    RAISE EXCEPTION 'Skipped order confirmation';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  UPDATE public.orders SET status = 'confirmed' WHERE id = (SELECT order_id FROM pho_audit_ids);
  UPDATE public.orders SET status = 'completed' WHERE id = (SELECT order_id FROM pho_audit_ids);
END;
$$;
RESET ROLE;
ROLLBACK;
