import assert from 'node:assert/strict';
import test, { afterEach, mock } from 'node:test';

import handler from './udonarium-backend.ts';

const envKeys = ['ACCESS_CONTROL_ALLOW_ORIGIN', 'SKYWAY_APP_ID', 'SKYWAY_SECRET', 'SKYWAY_UDONARIUM_LOBBY_SIZE', 'SKYWAY_TOKEN_TTL_SECONDS'];
const originalEnv = new Map(envKeys.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of envKeys) {
    const value = originalEnv.get(key);
    if (value == null) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  mock.restoreAll();
});

test('returns status with CORS headers for an allowed origin', async () => {
  setEnv();

  const response = await handler(new Request('https://backend.example/v1/status', { headers: { origin: 'https://app.example' } }));

  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'OK');
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://app.example');
  assert.equal(response.headers.get('Vary'), 'Origin');
});

test('rejects token requests from a disallowed origin', async () => {
  setEnv();

  const response = await handler(createTokenRequest(validTokenRequest(), 'https://evil.example'));

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: 'Origin is not allowed.' });
});

test('creates a scoped SkyWay auth token with the configured TTL', async () => {
  setEnv({
    SKYWAY_UDONARIUM_LOBBY_SIZE: '8',
    SKYWAY_TOKEN_TTL_SECONDS: '3600',
  });
  mock.method(Date, 'now', () => 1_700_000_000_000);

  const response = await handler(createTokenRequest(validTokenRequest()));
  const { token } = (await response.json()) as { token: string };
  const payload = decodeJwtPayload(token);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://app.example');
  assert.equal(payload.iat, 1_700_000_000);
  assert.equal(payload.exp, 1_700_003_600);
  assert.equal(payload.scope.app.id, 'skyway-app-id');
  assert.equal(payload.version, 2);

  const channels = payload.scope.app.channels as { name: string; actions: string[]; members: { name: string; actions: string[] }[] }[];
  assert.deepEqual(
    channels.map((channel) => channel.name),
    ['room-123', 'udonarium-lobby-*-of-8']
  );
  assert.deepEqual(channels[0].actions, ['read', 'create']);
  assert.equal(channels[0].members[0].name, 'peer_456');
  assert.deepEqual(channels[0].members[0].actions, ['write']);
});

test('falls back to a two hour token TTL when the configured value is invalid', async () => {
  setEnv({ SKYWAY_TOKEN_TTL_SECONDS: 'invalid' });
  mock.method(Date, 'now', () => 1_700_000_000_000);

  const response = await handler(createTokenRequest(validTokenRequest()));
  const { token } = (await response.json()) as { token: string };
  const payload = decodeJwtPayload(token);

  assert.equal(response.status, 200);
  assert.equal(payload.exp - payload.iat, 60 * 60 * 2);
});

test('returns 400 when SkyWay credentials are missing', async () => {
  setEnv({ SKYWAY_SECRET: '' });

  const response = await handler(createTokenRequest(validTokenRequest()));

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'SKYWAY_APP_ID and SKYWAY_SECRET are required.' });
});

test('returns 400 for malformed token request bodies', async () => {
  setEnv();

  const response = await handler(
    new Request('https://backend.example/v1/skyway2023/token', {
      method: 'POST',
      headers: { origin: 'https://app.example', 'content-type': 'application/json' },
      body: '{',
    })
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Request body must be JSON.' });
});

test('rejects invalid token request fields', async (t) => {
  const cases = [
    { name: 'unknown format version', body: { ...validTokenRequest(), formatVersion: 2 }, error: 'Invalid token request.' },
    { name: 'lobby channel request', body: { ...validTokenRequest(), channelName: 'udonarium-lobby-1-of-4' }, error: 'Invalid channel or peer name.' },
    { name: 'wildcard channel', body: { ...validTokenRequest(), channelName: 'room-*' }, error: 'Invalid channel or peer name.' },
    { name: 'wildcard peer', body: { ...validTokenRequest(), peerId: 'peer*' }, error: 'Invalid channel or peer name.' },
    { name: 'empty peer', body: { ...validTokenRequest(), peerId: '' }, error: 'Invalid token request.' },
  ];

  for (const item of cases) {
    await t.test(item.name, async () => {
      setEnv();

      const response = await handler(createTokenRequest(item.body));

      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), { error: item.error });
    });
  }
});

function setEnv(overrides: Record<string, string> = {}) {
  for (const key of envKeys) delete process.env[key];

  Object.assign(process.env, {
    ACCESS_CONTROL_ALLOW_ORIGIN: 'https://app.example',
    SKYWAY_APP_ID: 'skyway-app-id',
    SKYWAY_SECRET: 'skyway-secret',
    ...overrides,
  });
}

function validTokenRequest() {
  return {
    formatVersion: 1,
    channelName: 'room-123',
    peerId: 'peer_456',
  };
}

function createTokenRequest(body: unknown, origin: string = 'https://app.example'): Request {
  return new Request('https://backend.example/v1/skyway2023/token', {
    method: 'POST',
    headers: {
      origin,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

function decodeJwtPayload(token: string): any {
  const [, payload] = token.split('.');
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
}
