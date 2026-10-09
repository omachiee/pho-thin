import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { test } from 'node:test';
import { LoadingScreen, loadingDelay } from '../src/components/LoadingScreen';

test('loading waits for readiness without resetting the minimum or maximum duration', () => {
  assert.equal(loadingDelay(true, 100), 600);
  assert.equal(loadingDelay(true, 700), 0);
  assert.equal(loadingDelay(true, 2200), 0);
  assert.equal(loadingDelay(false, 2200), 3800);
  assert.equal(loadingDelay(false, 6000), 0);
  assert.equal(loadingDelay(false, 7000), 0);
});

test('loading has one accessible action/status and no fake percentage or painted progress image', () => {
  const html = renderToStaticMarkup(<LoadingScreen lang="vi" ready={false} onFinish={() => {}} />);
  assert.match(html, /data-testid="loading-screen"/);
  assert.match(html, /role="status"/);
  assert.match(html, /Vào xem trước/);
  assert.equal((html.match(/<button/g) || []).length, 1);
  assert.doesNotMatch(html, /loading-canva|aria-valuenow|progressbar|\d+%/);
});
