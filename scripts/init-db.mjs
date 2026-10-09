import { SQL } from 'bun';
import { readFile } from 'node:fs/promises';

const mode = process.argv[2] || '--check';
const tables = ['dishes', 'branches', 'articles', 'reservations', 'inquiries', 'security_logs', 'admin_profiles', 'orders', 'order_items'];
let sql;
let connectTimer;
let connected = false;
let stage = 'configuration';

try {
  if (!['--check', '--apply', '--smoke'].includes(mode)) throw new Error('BAD_MODE');
  if (!process.env.DATABASE_URL || !process.env.SUPABASE_URL) throw new Error('MISSING_DATABASE_CONFIGURATION');
  const url = new URL(process.env.DATABASE_URL);
  const project = new URL(process.env.SUPABASE_URL).hostname.split('.')[0];
  const username = decodeURIComponent(url.username);
  const direct = url.hostname === `db.${project}.supabase.co` && username === 'postgres';
  const pooler = url.hostname.endsWith('.pooler.supabase.com') && username === `postgres.${project}`;
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || (!direct && !pooler) || url.pathname !== '/postgres' || (url.port && url.port !== '5432')) throw new Error('WRONG_DATABASE_TARGET');
  if (url.searchParams.has('sslmode') && !['require', 'verify-ca', 'verify-full'].includes(url.searchParams.get('sslmode'))) throw new Error('TLS_REQUIRED');
  url.searchParams.delete('sslmode');
  const ca = process.env.DATABASE_CA_FILE ? await readFile(process.env.DATABASE_CA_FILE, 'utf8') : undefined;
  // ponytail: one verified connection is enough for local setup; Vercel uses the HTTP SDK.
  stage = 'connection';
  connectTimer = setTimeout(() => {
    console.error(JSON.stringify({ stage: 'connection', error: 'CONNECTION_TIMEOUT', action: 'Use the exact session-pooler connection from Supabase Connect. No schema written.' }));
    process.exit(1);
  }, 20000);
  sql = new SQL({ url: url.toString(), max: 1, connectionTimeout: 10, idleTimeout: 5, tls: { rejectUnauthorized: true, ...(ca ? { ca } : {}) } });
  const identity = await sql`SELECT current_database() AS database`;
  connected = true;
  clearTimeout(connectTimer);
  if (identity[0]?.database !== 'postgres') throw new Error('WRONG_DATABASE_TARGET');
  const existing = await sql`
    SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'
    AND tablename IN ('dishes','branches','articles','reservations','inquiries','security_logs','admin_profiles','orders','order_items')
    ORDER BY tablename
  `;
  console.log(JSON.stringify({ connected: true, verifiedTlsRequired: true, appTables: existing.length }));

  if (mode === '--apply') {
    if (existing.length !== 0) throw new Error('SCHEMA_ALREADY_EXISTS_USE_CHECK_OR_REVIEW_MIGRATION');
    stage = 'schema';
    await sql.unsafe(await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8'));
    stage = 'seed';
    await sql.unsafe(await readFile(new URL('../supabase/seed.sql', import.meta.url), 'utf8'));
    await sql.unsafe("NOTIFY pgrst, 'reload schema'");
    console.log('Schema and catalog seed applied. No Auth accounts created.');
  }

  if (mode === '--smoke') {
    if (existing.length !== tables.length) throw new Error('SCHEMA_NOT_READY');
    stage = 'rollback-security-check';
    await sql.unsafe(await readFile(new URL('../supabase/security-smoke.sql', import.meta.url), 'utf8'));
    console.log('Database security and order checks passed; fixtures rolled back.');
  }

  if (mode === '--apply' || existing.length === tables.length) {
    stage = 'verification';
    const counts = await sql`SELECT (SELECT count(*)::int FROM public.dishes) AS dishes,
      (SELECT count(*)::int FROM public.articles) AS articles, (SELECT count(*)::int FROM public.branches) AS branches`;
    const secured = await sql`SELECT count(*)::int AS count FROM pg_tables WHERE schemaname = 'public' AND rowsecurity
      AND tablename IN ('dishes','branches','articles','reservations','inquiries','security_logs','admin_profiles','orders','order_items')`;
    if (secured[0]?.count !== tables.length) throw new Error('RLS_NOT_ENABLED');
    console.log(JSON.stringify({ catalog: counts[0], securedTables: secured[0].count }));
    if (mode === '--apply' && (counts[0].dishes !== 14 || counts[0].articles !== 9 || counts[0].branches !== 4)) throw new Error('UNEXPECTED_SEED_COUNTS');
  }
} catch (error) {
  if (sql && connected) { try { await sql.unsafe('ROLLBACK'); } catch { /* Connection may have closed. */ } }
  // Do not print connection strings, database passwords, or error objects.
  const code = String(error.code || error.message || 'DATABASE_ERROR');
  console.error(JSON.stringify({ stage, error: /^[A-Z0-9_]{1,80}$/.test(code) ? code : 'DATABASE_ERROR', action: 'Check private DATABASE_URL / session pooler / TLS. No credentials logged.' }));
  process.exitCode = 1;
} finally {
  clearTimeout(connectTimer);
  if (sql) await sql.close({ timeout: 0 });
}
