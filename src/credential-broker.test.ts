import { once } from 'events';
import { ClientRequest, IncomingMessage, ServerResponse } from 'http';
import { PassThrough } from 'stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const loggerRef = vi.hoisted(() => ({ warn: vi.fn() }));
vi.mock('./logger.js', () => ({ logger: loggerRef }));

import {
  createBrokerProviderEnv,
  createProviderBrokerHandler,
  ProviderRequestFactory,
} from './credential-broker.js';

function fakeExchange(options: {
  authorization?: string;
  path?: string;
  xApiKey?: string;
}) {
  const request = new PassThrough() as PassThrough & IncomingMessage;
  request.method = 'POST';
  request.url = options.path || '/v1/messages?beta=true';
  request.headers = {
    authorization: options.authorization,
    'content-type': 'application/json',
    'x-api-key': options.xApiKey,
  };

  const response = new PassThrough() as PassThrough & ServerResponse;
  let status = 0;
  let responseBody = '';
  response.writeHead = ((code: number) => {
    status = code;
    return response;
  }) as typeof response.writeHead;
  response.on('data', (chunk) => (responseBody += chunk.toString()));

  const upstreamRequest = new PassThrough() as PassThrough & ClientRequest;
  let upstreamBody = '';
  upstreamRequest.on('data', (chunk) => (upstreamBody += chunk.toString()));
  upstreamRequest.on('finish', () => {
    const upstreamResponse = new PassThrough() as PassThrough & IncomingMessage;
    upstreamResponse.statusCode = 200;
    upstreamResponse.headers = { 'content-type': 'application/json' };
    upstreamRequest.emit('response', upstreamResponse);
    upstreamResponse.end('{"ok":true}');
  });

  let upstreamUrl: URL | undefined;
  let upstreamOptions: Parameters<ProviderRequestFactory>[1] | undefined;
  const requestFactory: ProviderRequestFactory = (url, requestOptions) => {
    upstreamUrl = url;
    upstreamOptions = requestOptions;
    return upstreamRequest;
  };

  return {
    request,
    requestFactory,
    response,
    results: () => ({
      responseBody,
      status,
      upstreamBody,
      upstreamOptions,
      upstreamUrl,
    }),
  };
}

describe('provider credential broker', () => {
  beforeEach(() => vi.clearAllMocks());

  it('keeps the raw API key out of container env and injects it only upstream', async () => {
    const rawCredential = 'sk-ant-medclaw-raw-canary';
    const capability = `medclaw_broker_${'a'.repeat(43)}`;
    const containerEnv = createBrokerProviderEnv(
      'api_key',
      'http://host.docker.internal:43123',
      capability,
    );
    const exchange = fakeExchange({ xApiKey: capability });
    const handler = createProviderBrokerHandler(
      {
        authKind: 'api_key',
        rawCredential,
        upstreamBaseUrl: 'https://api.anthropic.com',
      },
      capability,
      exchange.requestFactory,
    );

    handler(exchange.request, exchange.response);
    exchange.request.end('{"model":"synthetic"}');
    await once(exchange.response, 'finish');

    const result = exchange.results();
    expect(JSON.stringify(containerEnv)).not.toContain(rawCredential);
    expect(result.status).toBe(200);
    expect(result.responseBody).toBe('{"ok":true}');
    expect(result.upstreamUrl?.href).toBe(
      'https://api.anthropic.com/v1/messages?beta=true',
    );
    expect(result.upstreamOptions?.headers).toMatchObject({
      'x-api-key': rawCredential,
    });
    expect(result.upstreamBody).toBe('{"model":"synthetic"}');
  });

  it('rejects missing capability and non-provider paths before upstream', async () => {
    const capability = `medclaw_broker_${'b'.repeat(43)}`;
    for (const exchange of [
      fakeExchange({ path: '/v1/messages' }),
      fakeExchange({
        authorization: `Bearer ${capability}`,
        path: '/admin/secrets',
      }),
    ]) {
      const requestFactory = vi.fn(exchange.requestFactory);
      const handler = createProviderBrokerHandler(
        {
          authKind: 'oauth',
          rawCredential: 'oauth-medclaw-raw-canary',
          upstreamBaseUrl: 'https://api.anthropic.com',
        },
        capability,
        requestFactory,
      );

      handler(exchange.request, exchange.response);
      exchange.request.end();
      await once(exchange.response, 'finish');
      expect([401, 403]).toContain(exchange.results().status);
      expect(requestFactory).not.toHaveBeenCalled();
    }
    expect(
      loggerRef.warn.mock.calls.map(
        ([record]) => (record as { reason_code: string }).reason_code,
      ),
    ).toEqual(['invalid_capability', 'path_not_allowed']);
    expect(JSON.stringify(loggerRef.warn.mock.calls)).not.toContain(
      'oauth-medclaw-raw-canary',
    );
  });
});
