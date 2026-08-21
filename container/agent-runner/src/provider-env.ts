const PROVIDER_ENV_KEYS = [
  'ANTHROPIC_API_KEY',
  'ANTHROPIC_AUTH_TOKEN',
  'ANTHROPIC_BASE_URL',
  'CLAUDE_CODE_OAUTH_TOKEN',
] as const;

const BROKER_CAPABILITY = /^medclaw_broker_[A-Za-z0-9_-]{43}$/;

export type BrokerProviderEnv = Partial<
  Record<(typeof PROVIDER_ENV_KEYS)[number], string>
>;

export function buildSdkEnv(
  baseEnv: NodeJS.ProcessEnv,
  providerEnv?: BrokerProviderEnv,
): Record<string, string | undefined> {
  const sdkEnv: Record<string, string | undefined> = { ...baseEnv };
  for (const key of PROVIDER_ENV_KEYS) delete sdkEnv[key];
  if (!providerEnv || Object.keys(providerEnv).length === 0) return sdkEnv;

  const unknownKeys = Object.keys(providerEnv).filter(
    (key) =>
      !PROVIDER_ENV_KEYS.includes(key as (typeof PROVIDER_ENV_KEYS)[number]),
  );
  if (unknownKeys.length > 0) {
    throw new Error('provider_env:unknown_key');
  }

  const baseUrl = providerEnv.ANTHROPIC_BASE_URL;
  if (!baseUrl) throw new Error('provider_env:missing_broker_url');
  const parsedBaseUrl = new URL(baseUrl);
  if (
    parsedBaseUrl.protocol !== 'http:' ||
    !['host.docker.internal', '127.0.0.1'].includes(parsedBaseUrl.hostname)
  ) {
    throw new Error('provider_env:invalid_broker_url');
  }

  const authEntries = [
    providerEnv.ANTHROPIC_API_KEY,
    providerEnv.ANTHROPIC_AUTH_TOKEN,
    providerEnv.CLAUDE_CODE_OAUTH_TOKEN,
  ].filter((value): value is string => Boolean(value));
  if (authEntries.length !== 1 || !BROKER_CAPABILITY.test(authEntries[0])) {
    throw new Error('provider_env:invalid_broker_capability');
  }

  Object.assign(sdkEnv, providerEnv);
  return sdkEnv;
}
