import axios from 'axios';
import { randomUUID } from 'crypto';
import { DWClient, TOPIC_ROBOT, RobotMessage, EventAck } from 'dingtalk-stream';

import { ASSISTANT_NAME } from '../config.js';
import { readEnvFile } from '../env.js';
import { logger } from '../logger.js';
import { registerChannel, ChannelOpts } from './registry.js';
import {
  Channel,
  OnChatMetadata,
  OnInboundMessage,
  RegisteredGroup,
  StreamingMessage,
} from '../types.js';

export interface DingTalkChannelOpts {
  onMessage: OnInboundMessage;
  onChatMetadata: OnChatMetadata;
  registeredGroups: () => Record<string, RegisteredGroup>;
}

// Map conversationId to sessionWebhook for sending replies
type SessionWebhookMap = Map<string, string>;

interface DingTalkConversationTarget {
  isGroup: boolean;
  senderStaffId: string;
}

const DINGTALK_API_BASE = 'https://api.dingtalk.com';
const STREAM_UPDATE_INTERVAL_MS = 120;
const STREAM_UPDATE_CHARS = 48;

class DingTalkStreamingMessage implements StreamingMessage {
  private content = '';
  private lastSent = '';
  private closed = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private updateChain = Promise.resolve();

  constructor(
    private readonly update: (
      content: string,
      finalize: boolean,
      failed: boolean,
    ) => Promise<void>,
  ) {}

  async append(delta: string): Promise<void> {
    if (this.closed || !delta) return;
    this.content += delta;

    if (this.content.length - this.lastSent.length >= STREAM_UPDATE_CHARS) {
      await this.flush(false, false);
      return;
    }

    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.timer = null;
        void this.flush(false, false).catch(() => {
          // complete()/fail() await the same serialized chain and surface the
          // delivery error through the normal message reliability path.
        });
      }, STREAM_UPDATE_INTERVAL_MS);
    }
  }

  async complete(finalText: string): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    this.clearTimer();
    this.content = finalText;
    await this.flush(true, false);
  }

  async fail(_error?: unknown): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    this.clearTimer();
    await this.flush(false, true);
  }

  private clearTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private async flush(finalize: boolean, failed: boolean): Promise<void> {
    const snapshot = this.content;
    if (!finalize && !failed && snapshot === this.lastSent) return;
    this.lastSent = snapshot;
    const task = this.updateChain.then(() =>
      this.update(snapshot, finalize, failed),
    );
    this.updateChain = task.catch(() => undefined);
    await task;
  }
}

/**
 * DingTalk Channel using Stream Mode SDK
 * @see https://github.com/open-dingtalk/dingtalk-stream-sdk-nodejs
 */
export class DingTalkChannel implements Channel {
  name = 'dingtalk';

  private client: DWClient | null = null;
  private opts: DingTalkChannelOpts;
  private clientId: string;
  private clientSecret: string;
  private sessionWebhooks: SessionWebhookMap = new Map();
  private conversationTargets = new Map<string, DingTalkConversationTarget>();
  private aiCardTemplateId: string;
  private aiCardContentKey: string;

  constructor(
    clientId: string,
    clientSecret: string,
    opts: DingTalkChannelOpts,
    aiCardTemplateId = '',
    aiCardContentKey = 'content',
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.opts = opts;
    this.aiCardTemplateId = aiCardTemplateId;
    this.aiCardContentKey = aiCardContentKey || 'content';
  }

  async connect(): Promise<void> {
    this.client = new DWClient({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      debug: process.env.DINGTALK_DEBUG === 'true',
    });

    // Register robot message listener
    this.client.registerCallbackListener(TOPIC_ROBOT, async (res) => {
      try {
        const message = JSON.parse(res.data) as RobotMessage;
        await this.handleRobotMessage(message);
      } catch (err) {
        logger.error({ err }, 'Failed to parse DingTalk message');
      }
    });

    // Register all-event listener for ack
    this.client.registerAllEventListener((message) => {
      return { status: EventAck.SUCCESS };
    });

    // Start connection
    // Note: dingtalk-stream SDK doesn't emit a 'connect' event, but the connection
    // succeeds quickly. We use a short delay to ensure the WebSocket is ready.
    this.client.connect();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    logger.info('DingTalk bot connected');
  }

  private async handleRobotMessage(message: RobotMessage): Promise<void> {
    const {
      conversationId,
      senderStaffId,
      senderNick,
      conversationType,
      sessionWebhook,
      msgtype,
      text,
      msgId,
      createAt,
    } = message;

    // Store sessionWebhook for sending replies
    this.sessionWebhooks.set(conversationId, sessionWebhook);

    const chatJid = `dingtalk:${conversationId}`;
    const timestamp = new Date(createAt).toISOString();
    const senderName = senderNick || senderStaffId;
    const isGroup = conversationType === 'group' || conversationType === '2';
    this.conversationTargets.set(conversationId, {
      isGroup,
      senderStaffId,
    });

    // Store chat metadata
    this.opts.onChatMetadata(
      chatJid,
      timestamp,
      undefined,
      'dingtalk',
      isGroup,
    );

    // Check if registered
    const group = this.opts.registeredGroups()[chatJid];

    // Handle commands (work even for unregistered groups)
    if (msgtype === 'text' && text?.content) {
      const content = text.content.trim();

      // /chatid command
      if (content === '/chatid' || content === '！chatid') {
        const registeredStatus = group ? `已注册: ${group.name}` : '未注册';
        await this.sendMessage(
          chatJid,
          `Chat ID: \`${chatJid}\`\nConversation ID: ${conversationId}\nType: ${isGroup ? 'Group' : 'Private'}\n状态: ${registeredStatus}`,
        );
        return;
      }

      // Registration and main-group assignment are deliberately local-only.
      // A chat message is untrusted input and must never grant filesystem or
      // cross-group privileges.
      if (
        content === '/register' ||
        content === '！register' ||
        content.startsWith('/register ') ||
        content.startsWith('！register ') ||
        content === '/set-main' ||
        content === '！设置主群' ||
        content === '/set-main-confirm' ||
        content === '！确认设置主群' ||
        content === '/unset-main' ||
        content === '！取消主群' ||
        content === '/unset-main-confirm' ||
        content === '！确认取消主群'
      ) {
        if (group) {
          await this.sendMessage(
            chatJid,
            `此群聊已注册。\n名称: ${group.name}\n文件夹: ${group.folder}\n触发器: ${group.trigger}\n\n权限变更只能在 MedClaw 主机上通过本地 setup 执行。`,
          );
        } else {
          await this.sendMessage(
            chatJid,
            this.getLocalRegistrationHelp(chatJid),
          );
        }
        return;
      }

      // /ping command
      if (content === '/ping' || content === '！ping') {
        await this.sendMessage(chatJid, `${ASSISTANT_NAME} is online.`);
        return;
      }
    }

    // If not registered and not a command, ignore
    if (!group) {
      logger.debug(
        { chatJid, conversationId },
        'Message from unregistered DingTalk conversation',
      );
      return;
    }

    // Determine message content based on type
    let messageContent = '';
    switch (msgtype as string) {
      case 'text':
        messageContent = text?.content?.trim() || '';
        break;
      case 'image':
        messageContent = '[Image]';
        break;
      case 'file':
        messageContent = '[File]';
        break;
      case 'audio':
        messageContent = '[Audio]';
        break;
      case 'video':
        messageContent = '[Video]';
        break;
      case 'link':
        messageContent = '[Link]';
        break;
      default:
        messageContent = `[${msgtype}]`;
    }

    if (!messageContent) {
      return;
    }

    // Deliver message
    this.opts.onMessage(chatJid, {
      id: msgId,
      chat_jid: chatJid,
      sender: senderStaffId,
      sender_name: senderName,
      content: messageContent,
      timestamp,
      is_from_me: false,
    });

    logger.info({ chatJid, sender: senderName }, 'DingTalk message received');
  }

  private getLocalRegistrationHelp(chatJid: string): string {
    return `为了安全，群聊不能通过消息自行注册或获取 main 权限。

请在 MedClaw 主机上使用本地 setup 注册此 Chat ID：
${chatJid}

发送 /chatid 可再次查看 ID。`;
  }

  async sendMessage(jid: string, text: string): Promise<void> {
    const conversationId = jid.replace(/^dingtalk:/, '');
    const sessionWebhook = this.sessionWebhooks.get(conversationId);

    if (!sessionWebhook) {
      const error = new Error(`No sessionWebhook stored for ${jid}`);
      logger.warn({ jid }, error.message);
      throw error;
    }

    if (!this.client) {
      const error = new Error('DingTalk client not initialized');
      logger.warn(error.message);
      throw error;
    }

    try {
      const accessToken = await this.client.getAccessToken();

      // DingTalk has message length limits - split if needed
      const MAX_LENGTH = 2000;
      const chunks: string[] = [];

      if (text.length <= MAX_LENGTH) {
        chunks.push(text);
      } else {
        // Split into chunks, trying to break at newlines
        let remaining = text;
        while (remaining.length > 0) {
          const chunkEnd = Math.min(MAX_LENGTH, remaining.length);
          let splitPoint = chunkEnd;

          // Try to find a newline break point
          if (remaining.length > MAX_LENGTH) {
            const lastNewline = remaining.lastIndexOf('\n', MAX_LENGTH);
            if (lastNewline > MAX_LENGTH * 0.5) {
              splitPoint = lastNewline + 1;
            }
          }

          chunks.push(remaining.slice(0, splitPoint).trimEnd());
          remaining = remaining.slice(splitPoint);
        }
      }

      for (const chunk of chunks) {
        const body = {
          msgtype: 'text',
          text: {
            content: chunk,
          },
        };

        await axios({
          url: sessionWebhook,
          method: 'POST',
          responseType: 'json',
          data: body,
          headers: {
            'x-acs-dingtalk-access-token': accessToken,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        });
      }

      logger.info({ jid, length: text.length }, 'DingTalk message sent');
    } catch (err) {
      logger.error({ jid, err }, 'Failed to send DingTalk message');
      throw err;
    }
  }

  async startMessageStream(jid: string): Promise<StreamingMessage | null> {
    // DingTalk requires an AI-card template imported into the same app. With
    // no template configured, retain the normal one-message delivery path.
    if (!this.aiCardTemplateId) return null;
    if (!this.client) throw new Error('DingTalk client not initialized');

    const conversationId = jid.replace(/^dingtalk:/, '');
    const target = this.conversationTargets.get(conversationId);
    if (!target) return null;

    const accessToken = await this.client.getAccessToken();
    const headers = {
      'x-acs-dingtalk-access-token': accessToken,
      'Content-Type': 'application/json',
    };
    const outTrackId = randomUUID();

    await axios({
      url: `${DINGTALK_API_BASE}/v1.0/card/instances`,
      method: 'POST',
      responseType: 'json',
      data: {
        cardTemplateId: this.aiCardTemplateId,
        outTrackId,
        cardData: {
          cardParamMap: {
            [this.aiCardContentKey]: '',
            flowStatus: '1',
          },
        },
        callbackType: 'STREAM',
        imGroupOpenSpaceModel: { supportForward: true },
        imRobotOpenSpaceModel: { supportForward: true },
      },
      headers,
      timeout: 10000,
    });

    const deliverData: Record<string, unknown> = {
      outTrackId,
      userIdType: 1,
    };
    if (target.isGroup) {
      deliverData.openSpaceId = `dtv1.card//IM_GROUP.${conversationId}`;
      deliverData.imGroupOpenDeliverModel = { robotCode: this.clientId };
    } else {
      deliverData.openSpaceId = `dtv1.card//IM_ROBOT.${target.senderStaffId}`;
      deliverData.imRobotOpenDeliverModel = { spaceType: 'IM_ROBOT' };
    }

    await axios({
      url: `${DINGTALK_API_BASE}/v1.0/card/instances/deliver`,
      method: 'POST',
      responseType: 'json',
      data: deliverData,
      headers,
      timeout: 10000,
    });

    return new DingTalkStreamingMessage(async (content, finalize, failed) => {
      await axios({
        url: `${DINGTALK_API_BASE}/v1.0/card/streaming`,
        method: 'PUT',
        responseType: 'json',
        data: {
          outTrackId,
          guid: randomUUID(),
          key: this.aiCardContentKey,
          content,
          isFull: true,
          isFinalize: finalize,
          isError: failed,
        },
        headers,
        timeout: 10000,
      });
    });
  }

  isConnected(): boolean {
    return this.client !== null;
  }

  ownsJid(jid: string): boolean {
    return jid.startsWith('dingtalk:');
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
      this.sessionWebhooks.clear();
      this.conversationTargets.clear();
      logger.info('DingTalk bot disconnected');
    }
  }

  async setTyping(_jid: string, _isTyping: boolean): Promise<void> {
    // DingTalk doesn't support typing indicators via Stream API
  }
}

// Channel-factory registration (chat privilege registration remains local-only)
registerChannel('dingtalk', (opts: ChannelOpts) => {
  const envVars = readEnvFile([
    'DINGTALK_CLIENT_ID',
    'DINGTALK_CLIENT_SECRET',
    'DINGTALK_AI_CARD_TEMPLATE_ID',
    'DINGTALK_AI_CARD_CONTENT_KEY',
  ]);
  const clientId =
    process.env.DINGTALK_CLIENT_ID || envVars.DINGTALK_CLIENT_ID || '';
  const clientSecret =
    process.env.DINGTALK_CLIENT_SECRET || envVars.DINGTALK_CLIENT_SECRET || '';
  const aiCardTemplateId =
    process.env.DINGTALK_AI_CARD_TEMPLATE_ID ||
    envVars.DINGTALK_AI_CARD_TEMPLATE_ID ||
    '';
  const aiCardContentKey =
    process.env.DINGTALK_AI_CARD_CONTENT_KEY ||
    envVars.DINGTALK_AI_CARD_CONTENT_KEY ||
    'content';

  if (!clientId || !clientSecret) {
    logger.debug(
      'DingTalk: DINGTALK_CLIENT_ID or DINGTALK_CLIENT_SECRET not set',
    );
    return null;
  }

  return new DingTalkChannel(
    clientId,
    clientSecret,
    opts,
    aiCardTemplateId,
    aiCardContentKey,
  );
});
