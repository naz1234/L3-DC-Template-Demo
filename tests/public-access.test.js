import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/_middleware.js';
import { onRequest as onHealthRequest } from '../functions/api/health.js';
import { onRequest as onEntityRequest } from '../functions/api/entities/[[path]].js';

const origin = 'https://railog.example.com';

test('pages and assets open without cookies, auth configuration, or a database', async () => {
  for (const mode of [undefined, 'custom_pin', 'cloudflare_access', 'invalid']) {
    for (const path of ['/', '/depot-stabling', '/assets/app.js', '/favicon.png', '/.well-known/acme-challenge/token']) {
      let calls = 0;
      const response = await onRequest({
        request: new Request(`${origin}${path}`),
        env: { AUTH_MODE: mode },
        next: () => { calls += 1; return new Response('application content'); },
      });
      assert.equal(response.status, 200);
      assert.equal(await response.text(), 'application content');
      assert.equal(response.headers.has('Location'), false);
      assert.equal(calls, 1);
    }
  }
});

test('old login bookmarks redirect to the app without honoring external return URLs', async () => {
  for (const method of ['GET', 'HEAD']) {
    for (const path of ['/login', '/login.html', '/login/']) {
      const response = await onRequest({
        request: new Request(`${origin}${path}?returnTo=https://other.example`, { method }),
        next: () => assert.fail('The removed login page must not be served.'),
      });
      assert.equal(response.status, 302);
      assert.equal(response.headers.get('Location'), '/');
      assert.match(response.headers.get('Cache-Control'), /no-store/);
    }
  }
});

test('retired auth endpoints cannot send PINs or access old sessions', async () => {
  const env = new Proxy({}, { get: () => assert.fail('Auth bindings must not be accessed.') });
  for (const path of ['config', 'request-code', 'verify-code', 'session', 'logout', 'presence', 'unknown']) {
    for (const method of ['GET', 'POST', 'OPTIONS']) {
      const response = await onRequest({
        env,
        request: new Request(`${origin}/api/auth/${path}`, { method }),
        next: () => assert.fail('The retired auth service must not be called.'),
      });
      assert.equal(response.status, 410);
      assert.match((await response.json()).error, /Login has been removed/);
    }
  }
});

test('health and entity reads work through middleware without an identity', async () => {
  const env = {
    DB: {
      prepare: () => ({
        run: async () => ({}),
        first: async () => ({ name: 'entity_records' }),
        bind: () => ({ all: async () => ({ results: [] }) }),
      }),
    },
  };
  const healthContext = { request: new Request(`${origin}/api/health`), env };
  const health = await onRequest({ ...healthContext, next: () => onHealthRequest(healthContext) });
  assert.equal(health.status, 200);
  assert.equal((await health.json()).tableReady, true);

  const entityContext = {
    request: new Request(`${origin}/api/entities/DepotStabling`),
    params: { path: ['DepotStabling'] },
    env,
  };
  const entities = await onRequest({ ...entityContext, next: () => onEntityRequest(entityContext) });
  assert.equal(entities.status, 200);
  assert.deepEqual(await entities.json(), []);
});

test('same-origin writes need no login while cross-site writes stay blocked', async () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    for (const headers of [
      { Origin: origin, 'Sec-Fetch-Site': 'same-origin' },
      { Origin: origin },
      { Origin: 'https://other.example' },
      { Origin: origin, 'Sec-Fetch-Site': 'cross-site' },
      {},
    ]) {
      const allowed = headers.Origin === origin && headers['Sec-Fetch-Site'] !== 'cross-site';
      let calls = 0;
      const response = await onRequest({
        request: new Request(`${origin}/api/entities/DepotStabling`, { method, headers }),
        next: () => { calls += 1; return new Response('saved'); },
      });
      assert.equal(response.status, allowed ? 200 : 403);
      assert.equal(calls, allowed ? 1 : 0);
    }
  }
});
