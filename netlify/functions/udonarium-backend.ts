import { createHmac, randomUUID } from 'node:crypto';

type SkyWayAuthTokenRequest = {
  formatVersion: number;
  channelName: string;
  peerId: string;
};

type ChannelScope = {
  name: string;
  actions: string[];
  members: {
    name: string;
    actions: string[];
    publication?: {
      actions: string[];
    };
    subscription?: {
      actions: string[];
    };
  }[];
};

const corsMethods = 'GET,POST,OPTIONS';
const corsHeaders = 'Content-Type';
const tokenLifetimeSeconds = 60 * 60 * 24;

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get('origin') ?? '';
  const cors = createCorsHeaders(origin);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: cors ? 204 : 403, headers: cors ?? undefined });
  }

  if (url.pathname === '/v1/status' && request.method === 'GET') {
    if (origin && !cors) return jsonResponse({ error: 'Origin is not allowed.' }, 403);
    return textResponse('OK', 200, cors);
  }

  if (url.pathname === '/v1/skyway2023/token' && request.method === 'POST') {
    if (!cors) return jsonResponse({ error: 'Origin is not allowed.' }, 403);
    return createSkyWayAuthTokenResponse(request, cors);
  }

  return jsonResponse({ error: 'Not Found' }, 404, cors);
}

export const config = {
  path: '/v1/*',
};

async function createSkyWayAuthTokenResponse(request: Request, cors: HeadersInit): Promise<Response> {
  const appId = process.env.SKYWAY_APP_ID ?? '';
  const secret = process.env.SKYWAY_SECRET ?? '';
  const lobbySize = parseLobbySize(process.env.SKYWAY_UDONARIUM_LOBBY_SIZE);

  if (!appId || !secret) {
    return jsonResponse({ error: 'SKYWAY_APP_ID and SKYWAY_SECRET are required.' }, 400, cors);
  }

  let body: SkyWayAuthTokenRequest;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Request body must be JSON.' }, 400, cors);
  }

  if (body?.formatVersion !== 1 || !isValidName(body.channelName) || !isValidName(body.peerId)) {
    return jsonResponse({ error: 'Invalid token request.' }, 400, cors);
  }

  if (body.channelName.startsWith('udonarium-lobby-') || body.channelName.includes('*') || body.peerId.includes('*')) {
    return jsonResponse({ error: 'Invalid channel or peer name.' }, 400, cors);
  }

  const token = createSkyWayAuthToken(appId, secret, lobbySize, body.channelName, body.peerId);
  return jsonResponse({ token }, 200, cors);
}

function createSkyWayAuthToken(appId: string, secret: string, lobbySize: number, channelName: string, peerId: string): string {
  const now = Math.floor(Date.now() / 1000);
  const isPrivateRoom = channelName === peerId;
  const channels = new Map<string, ChannelScope>();

  channels.set(channelName, {
    name: channelName,
    actions: isPrivateRoom ? ['read', 'create', 'updateMetadata'] : ['read', 'create'],
    members: [
      {
        name: peerId,
        actions: ['write'],
        publication: {
          actions: ['write'],
        },
        subscription: {
          actions: ['write'],
        },
      },
      {
        name: '*',
        actions: ['signal'],
      },
    ],
  });

  channels.set(`udonarium-lobby-*-of-${lobbySize}`, {
    name: `udonarium-lobby-*-of-${lobbySize}`,
    actions: ['read', 'create'],
    members: [
      {
        name: peerId,
        actions: ['write'],
      },
    ],
  });

  return signJwt(
    {
      alg: 'HS256',
      typ: 'JWT',
    },
    {
      jti: randomUUID(),
      iat: now,
      exp: now + tokenLifetimeSeconds,
      scope: {
        app: {
          id: appId,
          turn: true,
          actions: ['read'],
          channels: Array.from(channels.values()),
        },
      },
      version: 2,
    },
    secret
  );
}

function createCorsHeaders(origin: string): HeadersInit | null {
  const allowOrigin = process.env.ACCESS_CONTROL_ALLOW_ORIGIN ?? '';
  const allowed = allowOrigin
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  if (allowed.includes('*')) {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': corsMethods,
      'Access-Control-Allow-Headers': corsHeaders,
    };
  }

  if (!origin) return null;

  const requestOrigin = canonicalOrigin(origin);
  const matchedOrigin = allowed.find((value) => canonicalOrigin(value) === requestOrigin);
  if (!matchedOrigin) return null;

  return {
    'Access-Control-Allow-Origin': requestOrigin,
    'Access-Control-Allow-Methods': corsMethods,
    'Access-Control-Allow-Headers': corsHeaders,
    Vary: 'Origin',
  };
}

function canonicalOrigin(value: string): string {
  try {
    return new URL(value).origin;
  } catch {
    return '';
  }
}

function jsonResponse(body: unknown, status: number, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  });
}

function textResponse(body: string, status: number, headers: HeadersInit = {}): Response {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      ...headers,
    },
  });
}

function isValidName(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_.%-]{1,128}$/.test(value);
}

function parseLobbySize(value: string | undefined): number {
  const lobbySize = Number.parseInt(value ?? '4', 10);
  if (!Number.isFinite(lobbySize) || lobbySize < 1 || 100 < lobbySize) return 4;
  return lobbySize;
}

function signJwt(header: unknown, payload: unknown, secret: string): string {
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const content = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac('sha256', secret).update(content).digest();

  return `${content}.${base64UrlEncode(signature)}`;
}

function base64UrlEncode(value: string | Buffer): string {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}
