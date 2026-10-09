import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { DISHES } from '../src/data/dishes';
import { ARTICLES } from '../src/data/news';
import { BRANCHES } from '../src/data/branches';
import { article, branch, dish, phone } from '../src/lib/server/validation';

const root = new URL('../', import.meta.url);
test('catalog seed uses complete, unique content and deployable images', () => {
  assert.equal(DISHES.length, 14);
  assert.equal(ARTICLES.length, 9);
  assert.equal(BRANCHES.length, 4);
  for (const records of [DISHES, ARTICLES, BRANCHES]) {
    assert.equal(new Set(records.map((record) => record.id)).size, records.length);
  }
  for (const item of [...DISHES, ...ARTICLES]) {
    assert.ok(item.image.startsWith('/assets/'));
    assert.ok(existsSync(new URL(`public${item.image}`, root)), item.image);
  }
  for (const entry of DISHES) {
    assert.ok(Number.isSafeInteger(entry.price) && entry.price >= 0);
    assert.doesNotThrow(() => dish({ ...entry, isAvailable: true }));
  }
  for (const entry of BRANCHES) assert.doesNotThrow(() => branch(entry));
  for (const entry of ARTICLES) assert.doesNotThrow(() => article(entry));
  assert.equal(phone('(+84) 033 9253 464'), '+840339253464');
  assert.throws(() => phone('09abc1234567'));
  assert.throws(() => phone('+84+123456789'));
  const sql = readFileSync(new URL('supabase/seed.sql', root), 'utf8');
  assert.ok(!/INSERT INTO public\.(reservations|inquiries|admin_profiles)/.test(sql));
  assert.ok(!sql.includes('/src/assets/'));
  for (const branch of BRANCHES) assert.ok(sql.includes(`'${branch.id}'`));
});
