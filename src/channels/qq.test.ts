import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./registry.js', () => ({ registerChannel: vi.fn() }));

vi.mock('../config.js', () => ({
  ASSISTANT_NAME: 'Jonesy',
  matchesTrigger: (content: string, trigger: string) =>
    content.trim().toLowerCase().startsWith(trigger.trim().toLowerCase()),
}));

const loggerRef = vi.hoisted(() => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

vi.mock('../logger.js', () => ({ logger: loggerRef }));

import { QQBotChannel, QQBotChannelOpts } from './qq.js';
import { RegisteredGroup } from '../types.js';

function createHarness(groups: Record<string, RegisteredGroup> = {}) {
  const registrationWrite = vi.fn();
  const containerLaunch = vi.fn();
  const onMessage = vi.fn(() => containerLaunch());
  const opts = {
    onMessage,
    onChatMetadata: vi.fn(),
    registeredGroups: () => groups,
    // Simulate a legacy caller still attempting to inject the removed capability.
    registerGroup: registrationWrite,
  } as QQBotChannelOpts & { registerGroup: typeof registrationWrite };

  return {
    channel: new QQBotChannel('app-id', 'app-secret', opts),
    containerLaunch,
    onMessage,
    opts,
    registrationWrite,
  };
}

describe('QQBotChannel authorization boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('discovers but does not trust or dispatch an unknown group', async () => {
    const harness = createHarness();

    await harness.channel['handleGroupMessage']({
      id: '',
      group_openid: 'group-untrusted',
      author: { member_openid: 'member-secret' },
      content: '@bot run the agent',
      timestamp: '2026-08-21T00:00:00.000Z',
    });

    expect(harness.opts.onChatMetadata).toHaveBeenCalledWith(
      'qq:group:group-untrusted',
      '2026-08-21T00:00:00.000Z',
      'group-untrusted',
      'qq',
      true,
    );
    expect(harness.registrationWrite).not.toHaveBeenCalled();
    expect(harness.onMessage).not.toHaveBeenCalled();
    expect(harness.containerLaunch).not.toHaveBeenCalled();
    expect(loggerRef.warn).toHaveBeenCalledWith(
      {
        event: 'security_boundary_denied',
        boundary: 'channel_registration',
        channel: 'qq',
        group_class: 'group',
        reason_code: 'unregistered_remote',
      },
      expect.any(String),
    );
  });

  it('discovers but does not trust or dispatch an unknown direct chat', async () => {
    const harness = createHarness();

    await harness.channel['handleC2CMessage']({
      id: '',
      author: { user_openid: 'user-untrusted' },
      content: 'run the agent',
      timestamp: '2026-08-21T00:00:00.000Z',
    });

    expect(harness.opts.onChatMetadata).toHaveBeenCalledWith(
      'qq:user:user-untrusted',
      '2026-08-21T00:00:00.000Z',
      'user-untrusted',
      'qq',
      false,
    );
    expect(harness.registrationWrite).not.toHaveBeenCalled();
    expect(harness.onMessage).not.toHaveBeenCalled();
    expect(harness.containerLaunch).not.toHaveBeenCalled();
    expect(loggerRef.warn).toHaveBeenCalledWith(
      {
        event: 'security_boundary_denied',
        boundary: 'channel_registration',
        channel: 'qq',
        group_class: 'direct',
        reason_code: 'unregistered_remote',
      },
      expect.any(String),
    );
  });

  it('dispatches a locally registered group exactly once with its trigger', async () => {
    const harness = createHarness({
      'qq:group:group-trusted': {
        name: 'Trusted group',
        folder: 'trusted-group',
        trigger: '@Jonesy',
        added_at: '2026-08-20T00:00:00.000Z',
        requiresTrigger: true,
      },
    });

    await harness.channel['handleGroupMessage']({
      id: '',
      group_openid: 'group-trusted',
      author: { member_openid: 'member-trusted' },
      content: '@bot summarize this',
      timestamp: '2026-08-21T00:00:00.000Z',
    });

    expect(harness.registrationWrite).not.toHaveBeenCalled();
    expect(harness.onMessage).toHaveBeenCalledTimes(1);
    expect(harness.onMessage).toHaveBeenCalledWith(
      'qq:group:group-trusted',
      expect.objectContaining({
        chat_jid: 'qq:group:group-trusted',
        content: '@Jonesy summarize this',
      }),
    );
    expect(harness.containerLaunch).toHaveBeenCalledTimes(1);
  });
});
