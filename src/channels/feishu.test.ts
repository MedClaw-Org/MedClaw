import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// --- Mocks ---

vi.mock('./registry.js', () => ({ registerChannel: vi.fn() }));

vi.mock('../config.js', () => ({
  ASSISTANT_NAME: 'Jonesy',
  TRIGGER_PATTERN: /^@Jonesy\b/i,
}));

vi.mock('../logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// --- @larksuiteoapi/node-sdk mock ---

const larkRef = vi.hoisted(() => ({
  client: null as any,
  wsClient: null as any,
  dispatcher: null as any,
}));

vi.mock('@larksuiteoapi/node-sdk', () => {
  class MockEventDispatcher {
    _handlers: Record<string, (data: any) => Promise<void>> = {};

    register(handlers: Record<string, (data: any) => Promise<void>>) {
      Object.assign(this._handlers, handlers);
      return this;
    }

    async dispatch(type: string, data: any): Promise<void> {
      const handler = this._handlers[type];
      if (handler) await handler(data);
    }
  }

  return {
    Client: class MockClient {
      appId: string;
      appSecret: string;

      request = vi.fn().mockResolvedValue({
        bot: { open_id: 'ou_bot_123' },
      });
      im = {
        v1: {
          message: {
            create: vi.fn().mockResolvedValue({}),
          },
          chat: {
            get: vi.fn().mockResolvedValue({ data: { name: 'Test Group' } }),
          },
        },
      };
      contact = {
        v3: {
          user: {
            get: vi.fn().mockResolvedValue({
              data: { user: { name: 'Alice Smith' } },
            }),
          },
        },
      };

      constructor(opts: any) {
        this.appId = opts.appId;
        this.appSecret = opts.appSecret;
        larkRef.client = this;
      }
    },

    WSClient: class MockWSClient {
      constructor(_opts: any) {
        larkRef.wsClient = this;
      }

      async start(opts: any) {
        larkRef.dispatcher = opts.eventDispatcher;
      }
    },

    EventDispatcher: MockEventDispatcher,
    AppType: { SelfBuild: 'SelfBuild' },
    Domain: { Feishu: 'feishu.cn' },
    LoggerLevel: { warn: 'warn' },
  };
});

// --- env mock ---

vi.mock('../env.js', () => ({
  readEnvFile: vi.fn().mockReturnValue({
    FEISHU_APP_ID: 'cli_test_app_id',
    FEISHU_APP_SECRET: 'test_app_secret',
  }),
}));

import { FeishuChannel, FeishuChannelOpts } from './feishu.js';

// --- Test helpers ---

function createTestOpts(overrides?: Partial<FeishuChannelOpts>): FeishuChannelOpts {
  return {
    onMessage: vi.fn(),
    onChatMetadata: vi.fn(),
    registeredGroups: vi.fn(() => ({
      'feishu:oc_test_group_id': {
        name: 'Test Group',
        folder: 'test-group',
        trigger: '@Jonesy',
        added_at: '2024-01-01T00:00:00.000Z',
      },
    })),
    ...overrides,
  };
}

function createMessageEvent(overrides: {
  messageId?: string;
  chatId?: string;
  chatType?: string;
  senderOpenId?: string;
  senderType?: string;
  msgType?: string;
  content?: string;
  mentions?: any[];
  createTime?: string;
} = {}) {
  return {
    sender: {
      sender_id: {
        open_id: overrides.senderOpenId ?? 'ou_user_456',
      },
      sender_type: overrides.senderType ?? 'user',
    },
    message: {
      message_id: overrides.messageId ?? 'om_test_1234567890',
      chat_id: overrides.chatId ?? 'oc_test_group_id',
      chat_type: overrides.chatType ?? 'group',
      message_type: overrides.msgType ?? 'text',
      content:
        overrides.content !== undefined
          ? overrides.content
          : JSON.stringify({ text: 'Hello everyone' }),
      mentions: overrides.mentions ?? [],
      create_time: overrides.createTime ?? '1704067200000',
    },
  };
}

async function triggerMessageEvent(data: ReturnType<typeof createMessageEvent>) {
  await larkRef.dispatcher?.dispatch('im.message.receive_v1', data);
}

function currentClient() {
  return larkRef.client;
}

function makeChannel(optsOverrides?: Partial<FeishuChannelOpts>) {
  return new FeishuChannel('cli_test_app_id', 'test_app_secret', createTestOpts(optsOverrides));
}

// --- Tests ---

describe('FeishuChannel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- Connection lifecycle ---

  describe('connection lifecycle', () => {
    it('resolves connect() and marks channel as connected', async () => {
      const channel = makeChannel();
      await channel.connect();
      expect(channel.isConnected()).toBe(true);
    });

    it('isConnected() returns false before connect', () => {
      const channel = makeChannel();
      expect(channel.isConnected()).toBe(false);
    });

    it('starts WSClient on connect', async () => {
      const channel = makeChannel();
      await channel.connect();
      expect(larkRef.wsClient).not.toBeNull();
      expect(larkRef.dispatcher).not.toBeNull();
    });

    it('fetches bot info on connect', async () => {
      const channel = makeChannel();
      await channel.connect();
      expect(currentClient().request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', url: expect.stringContaining('bot/v3/info') }),
      );
    });

    it('continues if bot info fetch fails', async () => {
      const channel = makeChannel();
      currentClient().request.mockRejectedValueOnce(new Error('API error'));
      await expect(channel.connect()).resolves.toBeUndefined();
      expect(channel.isConnected()).toBe(true);
    });

    it('disconnects cleanly', async () => {
      const channel = makeChannel();
      await channel.connect();
      expect(channel.isConnected()).toBe(true);
      await channel.disconnect();
      expect(channel.isConnected()).toBe(false);
    });
  });

  // --- Message handling ---

  describe('message handling', () => {
    it('delivers text message for registered chat', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(createMessageEvent());

      expect(opts.onChatMetadata).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.any(String),
        expect.any(String),
        'feishu',
        true,
      );
      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({
          id: 'om_test_1234567890',
          chat_jid: 'feishu:oc_test_group_id',
          sender: 'ou_user_456',
          content: 'Hello everyone',
          is_from_me: false,
        }),
      );
    });

    it('only emits metadata for unregistered chats', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(createMessageEvent({ chatId: 'oc_unknown_chat' }));

      expect(opts.onChatMetadata).toHaveBeenCalled();
      expect(opts.onMessage).not.toHaveBeenCalled();
    });

    it('skips messages with no message data', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent({ sender: {}, message: null } as any);

      expect(opts.onMessage).not.toHaveBeenCalled();
    });

    it('identifies p2p chat as non-group and uses sender name as chat name', async () => {
      const opts = createTestOpts({
        registeredGroups: vi.fn(() => ({
          'feishu:oc_dm_chat': {
            name: 'DM',
            folder: 'dm',
            trigger: '@Jonesy',
            added_at: '2024-01-01T00:00:00.000Z',
          },
        })),
      });
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(
        createMessageEvent({ chatId: 'oc_dm_chat', chatType: 'p2p' }),
      );

      expect(opts.onChatMetadata).toHaveBeenCalledWith(
        'feishu:oc_dm_chat',
        expect.any(String),
        'Alice Smith', // sender name used as chat name for p2p
        'feishu',
        false,
      );
    });

    it('converts create_time ms string to ISO timestamp', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(createMessageEvent({ createTime: '1704067200000' }));

      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({ timestamp: '2024-01-01T00:00:00.000Z' }),
      );
    });

    it('resolves user name from contact API', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(createMessageEvent({ senderOpenId: 'ou_user_456' }));

      expect(currentClient().contact.v3.user.get).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { user_id: 'ou_user_456' },
          params: { user_id_type: 'open_id' },
        }),
      );
      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({ sender_name: 'Alice Smith' }),
      );
    });

    it('falls back to open_id when user API fails', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      currentClient().contact.v3.user.get.mockRejectedValueOnce(new Error('API error'));

      await triggerMessageEvent(createMessageEvent({ senderOpenId: 'ou_unknown_user' }));

      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({ sender_name: 'ou_unknown_user' }),
      );
    });

    it('is_from_me is always false', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(createMessageEvent({ senderOpenId: 'ou_bot_123' }));

      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({ is_from_me: false }),
      );
    });
  });

  // --- Deduplication ---

  describe('deduplication', () => {
    it('skips duplicate message IDs', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      const event = createMessageEvent({ messageId: 'om_dup_001' });
      await triggerMessageEvent(event);
      await triggerMessageEvent(event);

      expect(opts.onMessage).toHaveBeenCalledTimes(1);
    });

    it('processes different message IDs independently', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(createMessageEvent({ messageId: 'om_a' }));
      await triggerMessageEvent(createMessageEvent({ messageId: 'om_b' }));

      expect(opts.onMessage).toHaveBeenCalledTimes(2);
    });
  });

  // --- /chatid and /ping commands ---

  describe('built-in commands', () => {
    it('replies to /chatid with chat info and does not call onMessage', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(
        createMessageEvent({ content: JSON.stringify({ text: '/chatid' }) }),
      );

      expect(currentClient().im.v1.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            receive_id: 'oc_test_group_id',
            content: expect.stringContaining('feishu:oc_test_group_id'),
          }),
        }),
      );
      expect(opts.onMessage).not.toHaveBeenCalled();
    });

    it('replies to /ping with online status', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(
        createMessageEvent({ content: JSON.stringify({ text: '/ping' }) }),
      );

      expect(currentClient().im.v1.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            content: expect.stringContaining('Jonesy is online'),
          }),
        }),
      );
      expect(opts.onMessage).not.toHaveBeenCalled();
    });
  });

  // --- @mention translation ---

  describe('@mention translation', () => {
    it('prepends trigger when bot is @mentioned', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect(); // botOpenId = 'ou_bot_123'

      await triggerMessageEvent(
        createMessageEvent({
          content: JSON.stringify({ text: 'Hey @_user_1 what do you think?' }),
          mentions: [{ key: '@_user_1', id: { open_id: 'ou_bot_123' }, name: 'Jonesy' }],
        }),
      );

      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({
          content: expect.stringMatching(/^@Jonesy /),
        }),
      );
    });

    it('does not prepend trigger when TRIGGER_PATTERN already matches', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(
        createMessageEvent({
          content: JSON.stringify({ text: '@Jonesy hello @_user_1' }),
          mentions: [{ key: '@_user_1', id: { open_id: 'ou_bot_123' }, name: 'Jonesy' }],
        }),
      );

      const call = (opts.onMessage as any).mock.calls[0][1];
      expect(call.content).not.toMatch(/^@Jonesy @Jonesy/);
    });

    it('replaces @mention placeholder keys with display names', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(
        createMessageEvent({
          content: JSON.stringify({ text: 'Hello @_user_1 and @_user_2' }),
          mentions: [
            { key: '@_user_1', id: { open_id: 'ou_alice' }, name: 'Alice' },
            { key: '@_user_2', id: { open_id: 'ou_bob' }, name: 'Bob' },
          ],
        }),
      );

      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({
          content: expect.stringContaining('@Alice'),
        }),
      );
    });

    it('does not modify content when no mentions', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(
        createMessageEvent({
          content: JSON.stringify({ text: 'Just a plain message' }),
          mentions: [],
        }),
      );

      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({ content: 'Just a plain message' }),
      );
    });
  });

  // --- Content extraction ---

  describe('content extraction', () => {
    it('extracts text from text messages', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(
        createMessageEvent({ content: JSON.stringify({ text: 'Hello world' }) }),
      );

      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({ content: 'Hello world' }),
      );
    });

    it('extracts text from post (rich text) messages', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      const postContent = {
        zh_cn: {
          title: 'My Title',
          content: [
            [
              { tag: 'text', text: 'Hello ' },
              { tag: 'a', href: 'https://example.com', text: 'link' },
            ],
          ],
        },
      };

      await triggerMessageEvent(
        createMessageEvent({ msgType: 'post', content: JSON.stringify(postContent) }),
      );

      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({ content: expect.stringContaining('My Title') }),
      );
    });

    it('returns [Image] for image messages', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(
        createMessageEvent({ msgType: 'image', content: JSON.stringify({ image_key: 'img_xyz' }) }),
      );

      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({ content: '[Image]' }),
      );
    });

    it('returns [Audio] for audio messages', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(
        createMessageEvent({ msgType: 'audio', content: JSON.stringify({}) }),
      );

      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({ content: '[Audio]' }),
      );
    });

    it('returns [Video] for media messages', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(
        createMessageEvent({ msgType: 'media', content: JSON.stringify({}) }),
      );

      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({ content: '[Video]' }),
      );
    });

    it('includes file name in file message placeholder', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(
        createMessageEvent({ msgType: 'file', content: JSON.stringify({ file_name: 'report.pdf' }) }),
      );

      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({ content: '[File: report.pdf]' }),
      );
    });

    it('uses "file" as fallback file name when missing', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(
        createMessageEvent({ msgType: 'file', content: JSON.stringify({}) }),
      );

      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({ content: '[File: file]' }),
      );
    });

    it('returns [Sticker] for sticker messages', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(
        createMessageEvent({ msgType: 'sticker', content: JSON.stringify({}) }),
      );

      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({ content: '[Sticker]' }),
      );
    });

    it('returns [Card] for interactive messages', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(
        createMessageEvent({ msgType: 'interactive', content: JSON.stringify({}) }),
      );

      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({ content: '[Card]' }),
      );
    });

    it('returns [Shared Group] for share_chat messages', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(
        createMessageEvent({ msgType: 'share_chat', content: JSON.stringify({}) }),
      );

      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({ content: '[Shared Group]' }),
      );
    });

    it('returns [Shared Contact] for share_user messages', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(
        createMessageEvent({ msgType: 'share_user', content: JSON.stringify({}) }),
      );

      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({ content: '[Shared Contact]' }),
      );
    });

    it('returns [Merge Forward] for merge_forward messages', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(
        createMessageEvent({ msgType: 'merge_forward', content: JSON.stringify({}) }),
      );

      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({ content: '[Merge Forward]' }),
      );
    });

    it('handles malformed JSON content gracefully', async () => {
      const opts = createTestOpts();
      const channel = new FeishuChannel('cli_test_app_id', 'test_app_secret', opts);
      await channel.connect();

      await triggerMessageEvent(createMessageEvent({ content: 'not-json' }));

      expect(opts.onMessage).toHaveBeenCalledWith(
        'feishu:oc_test_group_id',
        expect.objectContaining({ content: expect.any(String) }),
      );
    });
  });

  // --- sendMessage ---

  describe('sendMessage', () => {
    it('sends plain text via text msg_type', async () => {
      const channel = makeChannel();
      await channel.connect();

      await channel.sendMessage('feishu:oc_test_group_id', 'Hello world');

      expect(currentClient().im.v1.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { receive_id_type: 'chat_id' },
          data: expect.objectContaining({
            receive_id: 'oc_test_group_id',
            content: JSON.stringify({ text: 'Hello world' }),
            msg_type: 'text',
          }),
        }),
      );
    });

    it('sends Markdown via post msg_type with md tag', async () => {
      const channel = makeChannel();
      await channel.connect();

      await channel.sendMessage('feishu:oc_test_group_id', '**bold** and `code`');

      expect(currentClient().im.v1.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            msg_type: 'post',
            content: expect.stringContaining('md'),
          }),
        }),
      );
    });

    it('strips feishu: prefix from JID', async () => {
      const channel = makeChannel();
      await channel.connect();

      await channel.sendMessage('feishu:oc_some_other_chat', 'Hi');

      expect(currentClient().im.v1.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ receive_id: 'oc_some_other_chat' }),
        }),
      );
    });

    it('does not throw when API fails', async () => {
      const channel = makeChannel();
      await channel.connect();

      currentClient().im.v1.message.create.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        channel.sendMessage('feishu:oc_test_group_id', 'Will fail'),
      ).resolves.toBeUndefined();
    });

    it('is no-op when wsClient is null (not connected)', async () => {
      const channel = makeChannel();
      // Do not call connect()

      await channel.sendMessage('feishu:oc_test_group_id', 'Hello');

      expect(currentClient().im.v1.message.create).not.toHaveBeenCalled();
    });
  });

  // --- Markdown detection ---

  describe('Markdown → post format', () => {
    const markdownCases: [string, string][] = [
      ['**bold**', 'bold text'],
      ['_italic_', 'italic text'],
      ['`inline code`', 'inline code'],
      ['[link](https://example.com)', 'hyperlink'],
      ['# Heading', 'heading'],
      ['- list item', 'unordered list'],
      ['1. list item', 'ordered list'],
      ['> quote', 'blockquote'],
      ['```\ncode block\n```', 'code block'],
    ];

    for (const [text, label] of markdownCases) {
      it(`uses post format for ${label}`, async () => {
        const channel = makeChannel();
        await channel.connect();

        await channel.sendMessage('feishu:oc_test_group_id', text);

        expect(currentClient().im.v1.message.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ msg_type: 'post' }),
          }),
        );
      });
    }

    it('uses text format for plain text', async () => {
      const channel = makeChannel();
      await channel.connect();

      await channel.sendMessage('feishu:oc_test_group_id', 'Just a plain message');

      expect(currentClient().im.v1.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ msg_type: 'text' }),
        }),
      );
    });
  });

  // --- ownsJid ---

  describe('ownsJid', () => {
    it('owns feishu: JIDs', () => {
      expect(makeChannel().ownsJid('feishu:oc_123')).toBe(true);
    });

    it('does not own Telegram JIDs', () => {
      expect(makeChannel().ownsJid('tg:123456')).toBe(false);
    });

    it('does not own Slack JIDs', () => {
      expect(makeChannel().ownsJid('slack:C0123456789')).toBe(false);
    });

    it('does not own WhatsApp JIDs', () => {
      expect(makeChannel().ownsJid('12345@g.us')).toBe(false);
    });

    it('does not own unknown formats', () => {
      expect(makeChannel().ownsJid('random-string')).toBe(false);
    });
  });

  // --- setTyping ---

  describe('setTyping', () => {
    it('resolves without error (no-op)', async () => {
      await expect(
        makeChannel().setTyping('feishu:oc_test_group_id', true),
      ).resolves.toBeUndefined();
    });
  });

  // --- Channel properties ---

  describe('channel properties', () => {
    it('has name "feishu"', () => {
      expect(makeChannel().name).toBe('feishu');
    });
  });
});
