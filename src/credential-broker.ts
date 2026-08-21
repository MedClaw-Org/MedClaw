import { randomBytes, timingSafeEqual } from 'crypto';
import http, { IncomingHttpHeaders } from 'http';
import https from 'https';
import { AddressInfo } from 'net';

import { readEnvFile } from './env.js';
import {
  logSecurityBoundaryDenied,
  SecurityGroupClass,
} from './security-events.js';

export type ProviderAuthKind = 'api_key' | 'auth_token' | 'oauth';

export interface ProviderCredential {
  authKind: ProviderAuthKind;
  rawCredential: string;
  upstreamBaseUrl: string;
}

export interface BrokerProviderEnv {
  ANTHROPIC_BASE_URL: string;
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_AUTH_TOKEN?: string;
  CLAUDE_CODE_OAUTH_TOKEN?: string;
}

export interface ProviderCredentialBroker {
  close(): Promise<void>;
  containerEnv: BrokerProviderEnv;
  hostBaseUrl: string;
}

export type ProviderRequestFactory = (
  url: URL,
  options: http.RequestOptions,
) => http.ClientRequest;

const PROVIDER_KEYS = [
  'CLAUDE_CODE_OAUTH_TOKEN',
  'ANTHROPIC_API_KEY',
  'ANTHROPIC_BASE_URL',
  'ANTHROPIC_AUTH_TOKEN',
];

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

export function loadProviderCredential(): ProviderCredential | null {
  const fileValues = readEnvFile(PROVIDER_KEYS);
  const value = (key: string): string =>
    process.env[key] || fileValues[key] || '';
  const upstreamBaseUrl =
    value('ANTHROPIC_BASE_URL') || 'https://api.anthropic.com';

  const oauth = value('CLAUDE_CODE_OAUTH_TOKEN');
  if (oauth) {
    return { authKind: 'oauth', rawCredential: oauth, upstreamBaseUrl };
  }
  const authToken = value('ANTHROPIC_AUTH_TOKEN');
  if (authToken) {
    return {
      authKind: 'auth_token',
      rawCredential: authToken,
      upstreamBaseUrl,
    };
  }
  const apiKey = value('ANTHROPIC_API_KEY');
  if (apiKey) {
    return {
      authKind: 'api_key',
      rawCredential: apiKey,
      upstreamBaseUrl,
    };
  }
  return null;
}

function extractCapability(headers: IncomingHttpHeaders): string {
  const apiKey = headers['x-api-key'];
  if (typeof apiKey === 'string') return apiKey;

  const authorization = headers.authorization;
  if (typeof authorization === 'string') {
    return authorization.replace(/^Bearer\s+/i, '');
  }
  return '';
}

function capabilityMatches(candidate: string, expected: string): boolean {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  return (
    candidateBuffer.length === expectedBuffer.length &&
    timingSafeEqual(candidateBuffer, expectedBuffer)
  );
}

function buildUpstreamHeaders(
  incoming: IncomingHttpHeaders,
  credential: ProviderCredential,
): http.OutgoingHttpHeaders {
  const headers: http.OutgoingHttpHeaders = {};
  for (const [name, value] of Object.entries(incoming)) {
    const lower = name.toLowerCase();
    if (
      value === undefined ||
      lower === 'host' ||
      lower === 'authorization' ||
      lower === 'x-api-key' ||
      HOP_BY_HOP_HEADERS.has(lower)
    ) {
      continue;
    }
    headers[name] = value;
  }

  if (credential.authKind === 'api_key') {
    headers['x-api-key'] = credential.rawCredential;
  } else {
    headers.authorization = credential.rawCredential.startsWith('Bearer ')
      ? credential.rawCredential
      : `Bearer ${credential.rawCredential}`;
  }
  return headers;
}

export function createBrokerProviderEnv(
  authKind: ProviderAuthKind,
  brokerUrl: string,
  capability: string,
): BrokerProviderEnv {
  const containerEnv: BrokerProviderEnv = {
    ANTHROPIC_BASE_URL: brokerUrl,
  };
  if (authKind === 'api_key') {
    containerEnv.ANTHROPIC_API_KEY = capability;
  } else if (authKind === 'oauth') {
    containerEnv.CLAUDE_CODE_OAUTH_TOKEN = capability;
  } else {
    containerEnv.ANTHROPIC_AUTH_TOKEN = capability;
  }
  return containerEnv;
}

function buildUpstreamUrl(upstreamBaseUrl: string, requestUrl: URL): URL {
  const base = new URL(
    upstreamBaseUrl.endsWith('/') ? upstreamBaseUrl : `${upstreamBaseUrl}/`,
  );
  const prefix = base.pathname.replace(/\/$/, '');
  base.pathname = `${prefix}${requestUrl.pathname}`.replace(/\/{2,}/g, '/');
  base.search = requestUrl.search;
  return base;
}

export async function startProviderCredentialBroker(
  credential: ProviderCredential,
  options: {
    containerHost?: string;
    groupClass?: SecurityGroupClass;
    listenHost?: string;
  } = {},
): Promise<ProviderCredentialBroker> {
  const upstream = new URL(credential.upstreamBaseUrl);
  if (upstream.protocol !== 'http:' && upstream.protocol !== 'https:') {
    throw new Error('credential_broker:invalid_upstream_protocol');
  }

  const capability = `medclaw_broker_${randomBytes(32).toString('base64url')}`;
  const listenHost = options.listenHost || '0.0.0.0';
  const containerHost = options.containerHost || 'host.docker.internal';

  const server = http.createServer(
    createProviderBrokerHandler(
      credential,
      capability,
      undefined,
      options.groupClass,
    ),
  );

  server.on('clientError', (_err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, listenHost, () => {
      server.off('error', reject);
      resolve();
    });
  });

  const address = server.address() as AddressInfo;
  const brokerUrl = `http://${containerHost}:${address.port}`;
  const containerEnv = createBrokerProviderEnv(
    credential.authKind,
    brokerUrl,
    capability,
  );

  let closed = false;
  return {
    containerEnv,
    hostBaseUrl: `http://127.0.0.1:${address.port}`,
    async close(): Promise<void> {
      if (closed) return;
      closed = true;
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    },
  };
}

export function createProviderBrokerHandler(
  credential: ProviderCredential,
  capability: string,
  requestFactory?: ProviderRequestFactory,
  groupClass: SecurityGroupClass = 'unknown',
): http.RequestListener {
  return (request, response) => {
    if (!capabilityMatches(extractCapability(request.headers), capability)) {
      logSecurityBoundaryDenied({
        boundary: 'credential_broker',
        channel: 'internal',
        groupClass,
        reasonCode: 'invalid_capability',
      });
      response.writeHead(401, { 'content-type': 'application/json' });
      response.end('{"error":"credential_broker_unauthorized"}');
      return;
    }

    const requestUrl = new URL(request.url || '/', 'http://broker.invalid');
    if (
      !requestUrl.pathname.startsWith('/v1/') &&
      requestUrl.pathname !== '/api/event_logging/batch'
    ) {
      logSecurityBoundaryDenied({
        boundary: 'credential_broker',
        channel: 'internal',
        groupClass,
        reasonCode: 'path_not_allowed',
      });
      response.writeHead(403, { 'content-type': 'application/json' });
      response.end('{"error":"credential_broker_path_denied"}');
      return;
    }

    const upstreamUrl = buildUpstreamUrl(
      credential.upstreamBaseUrl,
      requestUrl,
    );
    const factory =
      requestFactory ||
      ((url: URL, requestOptions: http.RequestOptions) => {
        const client = url.protocol === 'https:' ? https : http;
        return client.request(url, requestOptions);
      });
    const upstreamRequest = factory(upstreamUrl, {
      method: request.method,
      headers: buildUpstreamHeaders(request.headers, credential),
    });

    upstreamRequest.on('response', (upstreamResponse) => {
      const responseHeaders: http.OutgoingHttpHeaders = {};
      for (const [name, value] of Object.entries(upstreamResponse.headers)) {
        if (
          value !== undefined &&
          !HOP_BY_HOP_HEADERS.has(name.toLowerCase())
        ) {
          responseHeaders[name] = value;
        }
      }
      response.writeHead(upstreamResponse.statusCode || 502, responseHeaders);
      upstreamResponse.pipe(response);
    });
    upstreamRequest.on('error', () => {
      if (!response.headersSent) {
        response.writeHead(502, { 'content-type': 'application/json' });
      }
      response.end('{"error":"credential_broker_upstream_failed"}');
    });
    request.on('aborted', () => upstreamRequest.destroy());
    request.pipe(upstreamRequest);
  };
}
