// Run: node --conditions=react-server --import tsx src/lib/server/backend.test.ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ApiError, article, canTransitionOrder, dish, inquiry, order, reservation } from './validation';
import { assertOrigin, handle, readJson } from './http';
import { adminSession } from './supabase';
import { mapArticle, mapDish } from './mappings';
import { GET as getCatalog } from '../../app/api/catalog/route';
import { GET as getSession } from '../../app/api/auth/route';
import { GET as getAdmin } from '../../app/api/admin/[resource]/route';

const now = Date.parse('2026-10-08T03:00:00Z');
const booking = { fullName: 'Nguyễn Văn A', phone: '0912345678', email: '', reservationDate: '2026-10-09', reservationTime: '12:00', partySize: 2, branchId: 'bo-ho', notes: '' };
const cart = { fullName: booking.fullName, phone: booking.phone, branchId: booking.branchId, pickupAt: '2026-10-09T12:00:00+07:00', notes: '', items: [{ dishId: 'pho-tai', quantity: 2 }] };
const invalid = (fn: () => unknown) => assert.throws(fn, (error: unknown) => error instanceof ApiError && error.status === 400);
assert.equal(reservation(booking, false, now).status, 'pending');
assert.equal(reservation(booking, false, now).isWalkIn, false);
for (const bad of [{ partySize: 0 }, { partySize: 51 }, { partySize: '2' }, { phone: '123' }, { reservationDate: '2026-02-30' }, { reservationTime: '24:00' }, { reservationDate: '2026-10-07' }, { status: 'confirmed' }, { id: 'forged' }, { branchName: 'forged' }]) invalid(() => reservation({ ...booking, ...bad }, false, now));
assert.equal(reservation({ ...booking, reservationDate: '2026-10-08', reservationTime: '09:00', isWalkIn: true, status: 'confirmed' }, true, now).isWalkIn, true);
assert.equal(order(cart, now).pickupAt, '2026-10-09T05:00:00.000Z');
for (const bad of [{ items: [] }, { items: [{ dishId: 'pho-tai', quantity: 51 }] }, { items: [{ dishId: 'pho-tai', quantity: 1.5 }] }, { items: [cart.items[0], cart.items[0]] }, { items: [{ ...cart.items[0], unitPrice: 1 }] }, { total: 1 }, { status: 'completed' }, { pickupAt: '2026-10-09T12:00' }, { pickupAt: '2026-10-09T24:00:00Z' }, { pickupAt: '2026-02-30T12:00:00Z' }, { pickupAt: '2027-10-09T12:00:00Z' }]) invalid(() => order({ ...cart, ...bad }, now));
assert(canTransitionOrder('pending', 'confirmed'));
assert(canTransitionOrder('pending', 'cancelled'));
assert(canTransitionOrder('confirmed', 'completed'));
assert(canTransitionOrder('confirmed', 'cancelled'));
for (const [from, to] of [['pending', 'completed'], ['completed', 'pending'], ['cancelled', 'confirmed'], ['pending', 'pending'], ['unknown', 'confirmed']]) assert.equal(canTransitionOrder(from, to), false);
assert.equal(inquiry({ type: 'inquiry', fullName: booking.fullName, phone: booking.phone, message: 'Xin chào' }).type, 'inquiry');
invalid(() => inquiry({ type: 'recruitment', fullName: booking.fullName, phone: booking.phone, message: 'Ứng tuyển' }));
invalid(() => inquiry({ type: 'inquiry', fullName: booking.fullName, phone: booking.phone, message: 'Xin chào', status: 'resolved' }));
const localized = { vi: 'Phở', en: 'Pho', zh: '粉', ko: '쌀국수' };
const lists = { vi: ['Thịt bò'], en: ['Beef'], zh: ['牛肉'], ko: ['소고기'] };
const menu = { id: 'pho-tai', category: 'pho', name: localized, price: 70000, formattedPrice: 'fake', image: '/assets/pho.jpg', shortDescription: localized, fullDescription: localized, ingredients: lists, isAvailable: true };
assert.equal(dish(menu).formattedPrice, '70.000');
for (const bad of [{ price: 1.5 }, { price: -1 }, { image: 'javascript:alert(1)' }, { image: '//evil.test/image' }, { isAvailable: 'false' }, { name: { vi: 'Phở' } }, { role: 'admin' }]) invalid(() => dish({ ...menu, ...bad }));
invalid(() => article({ id: 'article', title: localized, excerpt: localized, content: lists, date: '08/10/2026', readTime: '2 phút', category: localized, image: 'data:text/html,evil', author: 'Phở Thìn' }));
assert.equal(mapDish({ ...menu, image: '/src/assets/images/pho.jpg' }).image, '/assets/pho.jpg');
assert.equal(mapArticle({ image: 'https://cdn.test/src/assets/images/photo.jpg' }).image, 'https://cdn.test/src/assets/images/photo.jpg');

assertOrigin(new Request('https://pho.test/api/orders', { headers: { origin: 'https://pho.test' } }), 'https://pho.test');
assertOrigin(new Request('http://0.0.0.0:3000/api/orders', { headers: { host: 'localhost:3000', origin: 'http://localhost:3000' } }), '');
assertOrigin(new Request('http://internal/api/orders', { headers: { host: 'pho.test', 'x-forwarded-proto': 'https', origin: 'https://pho.test' } }), '');
assert.throws(() => assertOrigin(new Request('http://0.0.0.0:3000/api/orders', { headers: { host: 'localhost:3000', origin: 'https://evil.test' } }), ''), ApiError);
assert.throws(() => assertOrigin(new Request('https://pho.test/api/orders', { headers: { origin: 'https://evil.test' } }), 'https://pho.test'), ApiError);
assert.throws(() => assertOrigin(new Request('https://pho.test/api/orders'), 'https://pho.test'), ApiError);
const jsonRequest = (body: string, headers: Record<string, string> = { 'content-type': 'application/json' }) => new Request('https://pho.test/api/orders', { method: 'POST', headers, body });
assert.deepEqual(await readJson(jsonRequest('{"hello":true}')), { hello: true });
await assert.rejects(readJson(jsonRequest('invalid')), ApiError);
await assert.rejects(readJson(jsonRequest('{}', { 'content-type': 'text/plain' })), ApiError);
await assert.rejects(readJson(jsonRequest('"123456789"'), 4), ApiError);
await assert.rejects(readJson(jsonRequest('{}', { 'content-type': 'application/json', 'content-length': '999999' })), ApiError);
const cookieError = await handle(new Request('https://pho.test/api/auth'), async context => {
  context.cookies.push({ name: 'test-refresh', value: 'refresh', options: { httpOnly: true, secure: true, sameSite: 'lax' } });
  throw new ApiError(403, 'Not allowed');
});
assert.equal(cookieError.status, 403);
assert.match(cookieError.headers.get('set-cookie') || '', /test-refresh=refresh/);
assert.match(cookieError.headers.get('set-cookie') || '', /HttpOnly/);
assert.match(cookieError.headers.get('cache-control') || '', /no-store/);
const hidden = await handle(new Request('https://pho.test/api/auth'), async () => { throw new Error('secret connection password'); });
assert.equal(hidden.status, 503);
assert(!JSON.stringify(await hidden.json()).includes('secret'));

function authClient(user: object | null, allowed: boolean, roleError: object | null = null) {
  let checked = 0;
  return { client: { auth: { getUser: async () => { checked++; return { data: { user }, error: null }; } }, rpc: async () => ({ data: allowed, error: roleError }) } as unknown as SupabaseClient, checks: () => checked };
}
const admin = authClient({ email: 'admin@pho.test' }, true);
assert.deepEqual(await adminSession(admin.client), { email: 'admin@pho.test' });
assert.equal(admin.checks(), 1);
await assert.rejects(adminSession(authClient({ email: 'staff@pho.test' }, false).client), (error: unknown) => error instanceof ApiError && error.status === 403);
assert.equal(await adminSession(authClient(null, false).client, false), null);
await assert.rejects(adminSession(authClient(null, false).client), (error: unknown) => error instanceof ApiError && error.status === 401);
await assert.rejects(adminSession(authClient({ email: 'admin@pho.test' }, true, { code: 'network' }).client), (error: unknown) => error instanceof ApiError && error.status === 503);

// Deliberately clear configuration: these checks never connect to a database or read secrets.
for (const key of ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_SECRET_KEY', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']) delete process.env[key];
for (const response of [await getCatalog(new Request('https://pho.test/api/catalog')), await getSession(new Request('https://pho.test/api/auth')), await getAdmin(new Request('https://pho.test/api/admin/orders'), { params: Promise.resolve({ resource: 'orders' }) })]) {
  assert.equal(response.status, 503);
  const envelope = await response.json();
  assert.equal(typeof envelope.error, 'string');
  assert.equal('data' in envelope, false);
  assert.match(response.headers.get('cache-control') || '', /no-store/);
}
// Static regression checks are not a PostgreSQL execution test.
const schema = readFileSync(new URL('../../../supabase/schema.sql', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../../../supabase/migrations/202610080001_server_backend.sql', import.meta.url), 'utf8');
assert(schema.endsWith(migration), 'Fresh-schema safety must stay identical to the migration');
assert.match(migration, /REVOKE ALL ON FUNCTION public\.create_order\(text, text, text, text, text, jsonb\) FROM PUBLIC, anon, authenticated/);
assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.create_order\(text, text, text, text, text, jsonb\) TO service_role/);
assert.match(migration, /REVOKE ALL ON public\.%I FROM PUBLIC, anon, authenticated/);
assert.match(migration, /GRANT UPDATE \(status\) ON public\.orders TO authenticated/);
assert.match(migration, /CREATE POLICY profile_self_read .* FOR SELECT TO authenticated/);
assert.match(migration, /DROP POLICY IF EXISTS "Anyone can upload to pho-thin-assets"/);
assert(!/DROP TABLE|TRUNCATE TABLE/i.test(migration), 'Migration must preserve existing tables and records');
console.log('Backend validation, auth, HTTP, missing-configuration and static schema assertions passed. No database connections made.');
