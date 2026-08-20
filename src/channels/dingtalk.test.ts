import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const axiosRef = vi.hoisted(() => ({
  request: vi.fn(async (_request: any) => ({ data: {} })),
}));

vi.mock('axios', () => ({ default: axiosRef.request }));

import { DingTalkChannel } from './dingtalk.js';

describe('DingTalkChannel', () => {
  const mockOpts = {
    onMessage: vi.fn(),
    onChatMetadata: vi.fn(),
    registeredGroups: () => ({}),
  };

  const clientId = 'test-client-id';
  const clientSecret = 'test-client-secret';

  beforeEach(() => {
    axiosRef.request.mockClear();
  });

  describe('constructor', () => {
    it('should create a channel with correct name', () => {
      const channel = new DingTalkChannel(clientId, clientSecret, mockOpts);
      expect(channel.name).toBe('dingtalk');
    });

    it('should store credentials and opts', () => {
      const channel = new DingTalkChannel(clientId, clientSecret, mockOpts);
      expect(channel['clientId']).toBe(clientId);
      expect(channel['clientSecret']).toBe(clientSecret);
      expect(channel['opts']).toBe(mockOpts);
    });
  });

  describe('isConnected', () => {
    it('should return false when not connected', () => {
      const channel = new DingTalkChannel(clientId, clientSecret, mockOpts);
      expect(channel.isConnected()).toBe(false);
    });

    it('should return true after connect (mocked)', () => {
      const channel = new DingTalkChannel(clientId, clientSecret, mockOpts);
      channel['client'] = {} as any;
      expect(channel.isConnected()).toBe(true);
    });
  });

  describe('ownsJid', () => {
    it('should return true for dingtalk: prefixed jids', () => {
      const channel = new DingTalkChannel(clientId, clientSecret, mockOpts);
      expect(channel.ownsJid('dingtalk:abc123')).toBe(true);
      expect(channel.ownsJid('dingtalk:123456789')).toBe(true);
    });

    it('should return false for other jids', () => {
      const channel = new DingTalkChannel(clientId, clientSecret, mockOpts);
      expect(channel.ownsJid('telegram:123')).toBe(false);
      expect(channel.ownsJid('slack:abc')).toBe(false);
      expect(channel.ownsJid('whatsapp:123')).toBe(false);
      expect(channel.ownsJid('feishu:oc_123')).toBe(false);
    });
  });

  describe('setTyping', () => {
    it('should be a no-op (DingTalk does not support typing indicators)', async () => {
      const channel = new DingTalkChannel(clientId, clientSecret, mockOpts);
      await expect(
        channel.setTyping('dingtalk:123', true),
      ).resolves.toBeUndefined();
    });
  });

  describe('disconnect', () => {
    it('should clear client and session webhooks', async () => {
      const channel = new DingTalkChannel(clientId, clientSecret, mockOpts);
      const mockClient = {
        disconnect: vi.fn(),
      };
      channel['client'] = mockClient as any;
      channel['sessionWebhooks'].set('conv1', 'webhook1');

      await channel.disconnect();

      expect(mockClient.disconnect).toHaveBeenCalled();
      expect(channel['client']).toBeNull();
      expect(channel['sessionWebhooks'].size).toBe(0);
    });

    it('should be a no-op when already disconnected', async () => {
      const channel = new DingTalkChannel(clientId, clientSecret, mockOpts);
      await expect(channel.disconnect()).resolves.toBeUndefined();
    });
  });

  describe('sendMessage', () => {
    it('rejects if no sessionWebhook is stored', async () => {
      const channel = new DingTalkChannel(clientId, clientSecret, mockOpts);
      await expect(
        channel.sendMessage('dingtalk:unknown', 'test message'),
      ).rejects.toThrow('No sessionWebhook');
    });

    it('rejects if the client is not initialized', async () => {
      const channel = new DingTalkChannel(clientId, clientSecret, mockOpts);
      channel['sessionWebhooks'].set('conv1', 'webhook1');
      await expect(
        channel.sendMessage('dingtalk:conv1', 'test message'),
      ).rejects.toThrow('not initialized');
    });
  });

  describe('message streaming', () => {
    const incomingMessage = {
      conversationId: 'conv-stream',
      conversationType: '2',
      senderStaffId: 'user-1',
      senderNick: 'Alice',
      sessionWebhook: 'https://example.invalid/webhook',
      msgtype: 'text',
      text: { content: '@Andy stream this' },
      msgId: 'msg-stream',
      createAt: Date.now(),
    } as any;

    it('falls back to a normal final message when no card template is configured', async () => {
      const channel = new DingTalkChannel(clientId, clientSecret, mockOpts);
      channel['client'] = { getAccessToken: vi.fn() } as any;
      channel['conversationTargets'].set('conv-stream', {
        isGroup: true,
        senderStaffId: 'user-1',
      });

      await expect(
        channel.startMessageStream('dingtalk:conv-stream'),
      ).resolves.toBeNull();
      expect(axiosRef.request).not.toHaveBeenCalled();
    });

    it('creates, updates and finalizes one DingTalk AI card', async () => {
      const opts = {
        ...mockOpts,
        registeredGroups: () => ({
          'dingtalk:conv-stream': {
            name: 'Stream group',
            folder: 'stream-group',
            trigger: '@Andy',
            added_at: new Date().toISOString(),
          },
        }),
      };
      const channel = new DingTalkChannel(
        clientId,
        clientSecret,
        opts,
        'template.schema',
        'content',
      );
      channel['client'] = {
        getAccessToken: vi.fn(async () => 'access-token'),
      } as any;
      await channel['handleRobotMessage'](incomingMessage);

      const stream = await channel.startMessageStream('dingtalk:conv-stream');
      expect(stream).not.toBeNull();
      await stream!.append('a'.repeat(60));
      await stream!.complete('Canonical final answer');

      const calls = axiosRef.request.mock.calls.map(([request]) => request);
      expect(calls[0]).toMatchObject({
        method: 'POST',
        url: 'https://api.dingtalk.com/v1.0/card/instances',
        data: {
          cardTemplateId: 'template.schema',
          cardData: {
            cardParamMap: { content: '', flowStatus: '1' },
          },
        },
      });
      expect(calls[1]).toMatchObject({
        method: 'POST',
        url: 'https://api.dingtalk.com/v1.0/card/instances/deliver',
        data: {
          openSpaceId: 'dtv1.card//IM_GROUP.conv-stream',
          imGroupOpenDeliverModel: { robotCode: clientId },
        },
      });
      expect(calls.at(-1)).toMatchObject({
        method: 'PUT',
        url: 'https://api.dingtalk.com/v1.0/card/streaming',
        data: {
          key: 'content',
          content: 'Canonical final answer',
          isFull: true,
          isFinalize: true,
          isError: false,
        },
      });
    });

    it('marks an interrupted AI card as failed', async () => {
      const channel = new DingTalkChannel(
        clientId,
        clientSecret,
        mockOpts,
        'template.schema',
      );
      channel['client'] = {
        getAccessToken: vi.fn(async () => 'access-token'),
      } as any;
      channel['conversationTargets'].set('conv-stream', {
        isGroup: true,
        senderStaffId: 'user-1',
      });

      const stream = await channel.startMessageStream('dingtalk:conv-stream');
      await stream!.append('partial');
      await stream!.fail(new Error('model failed'));

      expect(axiosRef.request.mock.calls.at(-1)?.[0]).toMatchObject({
        method: 'PUT',
        data: { isFinalize: false, isError: true },
      });
    });
  });

  describe('privileged commands', () => {
    const robotMessage = (content: string) =>
      ({
        conversationId: 'conv-security',
        conversationType: '2',
        senderStaffId: 'untrusted-user',
        senderNick: 'Mallory',
        sessionWebhook: 'https://example.invalid/webhook',
        msgtype: 'text',
        text: { content },
        msgId: `msg-${content}`,
        createAt: Date.now(),
      }) as any;

    it('does not allow an unregistered chat to self-register', async () => {
      const opts = {
        ...mockOpts,
        onMessage: vi.fn(),
        registeredGroups: () => ({}),
      };
      const channel = new DingTalkChannel(clientId, clientSecret, opts);
      const send = vi.spyOn(channel, 'sendMessage').mockResolvedValue();

      await channel['handleRobotMessage'](
        robotMessage('/register Owned|owned|@Andy'),
      );

      expect(opts.onMessage).not.toHaveBeenCalled();
      expect(send).toHaveBeenCalledWith(
        'dingtalk:conv-security',
        expect.stringContaining('请在 MedClaw 主机上'),
      );
    });

    it('does not allow a registered chat to grant itself main access', async () => {
      const opts = {
        ...mockOpts,
        onMessage: vi.fn(),
        registeredGroups: () => ({
          'dingtalk:conv-security': {
            name: 'Normal group',
            folder: 'normal',
            trigger: '@Andy',
            added_at: new Date().toISOString(),
          },
        }),
      };
      const channel = new DingTalkChannel(clientId, clientSecret, opts);
      const send = vi.spyOn(channel, 'sendMessage').mockResolvedValue();

      await channel['handleRobotMessage'](robotMessage('/set-main-confirm'));

      expect(opts.onMessage).not.toHaveBeenCalled();
      expect(send).toHaveBeenCalledWith(
        'dingtalk:conv-security',
        expect.stringContaining('权限变更只能'),
      );
    });
  });
});
