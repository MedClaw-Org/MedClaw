import { describe, expect, it } from 'vitest';

import { buildSdkEnv } from '../../container/agent-runner/src/provider-env.js';

const capability = `medclaw_broker_${'a'.repeat(43)}`;

describe('agent runner provider environment', () => {
  it('removes raw inherited provider configuration and accepts only broker capability', () => {
    const rawCanary = 'sk-ant-raw-inherited-canary';
    const env = buildSdkEnv(
      {
        PATH: '/usr/bin',
        ANTHROPIC_API_KEY: rawCanary,
        ANTHROPIC_AUTH_TOKEN: rawCanary,
        CLAUDE_CODE_OAUTH_TOKEN: rawCanary,
        ANTHROPIC_BASE_URL: 'https://api.anthropic.com',
      },
      {
        ANTHROPIC_BASE_URL: 'http://host.docker.internal:43123',
        ANTHROPIC_API_KEY: capability,
      },
    );

    expect(JSON.stringify(env)).not.toContain(rawCanary);
    expect(env).toMatchObject({
      PATH: '/usr/bin',
      ANTHROPIC_BASE_URL: 'http://host.docker.internal:43123',
      ANTHROPIC_API_KEY: capability,
    });
    expect(env.ANTHROPIC_AUTH_TOKEN).toBeUndefined();
    expect(env.CLAUDE_CODE_OAUTH_TOKEN).toBeUndefined();
  });

  it('rejects direct provider URLs and raw-looking credentials', () => {
    expect(() =>
      buildSdkEnv(
        {},
        {
          ANTHROPIC_BASE_URL: 'https://api.anthropic.com',
          ANTHROPIC_API_KEY: 'sk-ant-direct-secret',
        },
      ),
    ).toThrow('provider_env:invalid_broker_url');
  });
});
