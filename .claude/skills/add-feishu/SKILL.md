---
name: add-feishu
description: Add Feishu (飞书/Lark) as a channel. Uses WebSocket long connection mode — no public URL or webhook needed.
---

# Add Feishu Channel

This skill adds Feishu (飞书) support to NanoClaw using the skills engine for deterministic code changes, then walks through interactive setup.

## Phase 1: Pre-flight

### Check if already applied

Read `.nanoclaw/state.yaml`. If `feishu` is in `applied_skills`, skip to Phase 3 (Setup). The code changes are already in place.

### Ask the user

**Do they already have a Feishu self-built app?** If yes, collect the App ID and App Secret now. If no, we'll create one in Phase 3.

## Phase 2: Apply Code Changes

Run the skills engine to apply this skill's code package. The package files are in this directory alongside this SKILL.md.

### Initialize skills system (if needed)

If `.nanoclaw/` directory doesn't exist yet:

```bash
npx tsx scripts/apply-skill.ts --init
```

### Apply the skill

```bash
npx tsx scripts/apply-skill.ts .claude/skills/add-feishu
```

This deterministically:
- Adds `src/channels/feishu.ts` (FeishuChannel class with self-registration via `registerChannel`)
- Adds `src/channels/feishu.test.ts` (unit tests)
- Appends `import './feishu.js'` to the channel barrel file `src/channels/index.ts`
- Installs the `@larksuiteoapi/node-sdk` npm dependency
- Records the application in `.nanoclaw/state.yaml`

If the apply reports merge conflicts, read the intent file:
- `modify/src/channels/index.ts.intent.md` — what changed and invariants

### Validate code changes

```bash
npm test
npm run build
```

All tests must pass and build must be clean before proceeding.

## Phase 3: Setup

### Create Feishu Self-Built App (if needed)

1. Go to [open.feishu.cn/app](https://open.feishu.cn/app) (Feishu) or [open.larksuite.com/app](https://open.larksuite.com/app) (Lark)
2. Click **Create App** → **Self-Built App**
3. Give it a name (e.g. "NanoClaw") and description

### Configure app permissions

In the app settings, go to **Permissions & Scopes** and add:

| Permission | Purpose |
|---|---|
| `im:message` | Receive and send messages |
| `im:message.group_at_msg` | Receive @mentions in group chats |
| `im:message.p2p_msg` | Receive direct messages |
| `contact:user.base:readonly` | Resolve user names |
| `im:chat:readonly` | Resolve chat names |

### Enable event subscriptions

Go to **Event Subscriptions** → **Add Event** → subscribe to:

- `im.message.receive_v1` — receive all message events

Under **Subscription Method**, select **Using Long Connection** (WebSocket). This avoids needing a public URL.

### Get credentials

Go to **App Credentials** and copy:
- **App ID** — looks like `cli_xxxxxxxxxx`
- **App Secret** — the secret key

### Configure environment

Add to `.env`:

```bash
FEISHU_APP_ID=cli_your_app_id
FEISHU_APP_SECRET=your_app_secret
```

Channels auto-enable when their credentials are present — no extra configuration needed.

Sync to container environment:

```bash
mkdir -p data/env && cp .env data/env/env
```

### Publish the app

The app must be published (or made available) before the bot can receive messages:

1. Go to **Version Management & Release** → **Create Version**
2. Fill in version number and release notes
3. Submit for review (internal enterprise apps are usually auto-approved)

For development/testing, you can use **Test Enterprises** to bypass the review step.

### Build and restart

```bash
npm run build
launchctl kickstart -k gui/$(id -u)/com.nanoclaw
```

## Phase 4: Registration

### Get Chat ID

Tell the user:

> 1. Add the bot to a Feishu group (or start a direct message with it)
> 2. In that chat, send: `/chatid`
> 3. The bot will reply with the chat's registration ID
>
> The JID format for NanoClaw is: `feishu:oc_xxxxxxxxxxxxxxxxxx`

Wait for the user to provide the chat ID.

### Register the chat

For a main chat (responds to all messages):

```typescript
registerGroup("feishu:<chat-id>", {
  name: "<chat-name>",
  folder: "feishu_main",
  trigger: `@${ASSISTANT_NAME}`,
  added_at: new Date().toISOString(),
  requiresTrigger: false,
  isMain: true,
});
```

For additional chats (trigger-only):

```typescript
registerGroup("feishu:<chat-id>", {
  name: "<chat-name>",
  folder: "feishu_<chat-name>",
  trigger: `@${ASSISTANT_NAME}`,
  added_at: new Date().toISOString(),
  requiresTrigger: true,
});
```

## Phase 5: Verify

### Test the connection

Tell the user:

> Send a message in your registered Feishu chat:
> - For main chat: Any message works
> - For non-main: `@<bot-name> hello` (using @mention)
>
> The bot should respond within a few seconds.

### Check logs if needed

```bash
tail -f logs/nanoclaw.log
```

## Troubleshooting

### Bot not responding

1. Check `FEISHU_APP_ID` and `FEISHU_APP_SECRET` are set in `.env` AND synced to `data/env/env`
2. Check chat is registered: `sqlite3 store/messages.db "SELECT * FROM registered_groups WHERE jid LIKE 'feishu:%'"`
3. For non-main chats: message must @mention the bot
4. Service is running: `launchctl list | grep nanoclaw`

### Bot connected but not receiving messages

1. Verify the app has been published / approved in the Feishu admin console
2. Verify `im.message.receive_v1` event subscription is enabled
3. Verify **Using Long Connection** is selected in Event Subscriptions (not HTTP callback)
4. Confirm the bot has been added to the group chat
5. Check logs for WebSocket connection errors

### "Permission denied" errors

1. Go to **Permissions & Scopes** in your app settings
2. Ensure all required permissions are added and enabled
3. Re-publish the app after adding permissions
4. For contact/user permissions, the enterprise admin may need to approve

### Getting chat ID without /chatid command

If the bot is not yet responding to commands, you can get the chat ID via the Feishu API:

```bash
# List chats the bot is in (replace with your actual token)
curl -H "Authorization: Bearer <tenant_access_token>" \
  "https://open.feishu.cn/open-apis/im/v1/chats?page_size=20"
```

Or check the event logs in the Feishu developer console — message events include `chat_id`.

### WebSocket reconnection

The `@larksuiteoapi/node-sdk` WSClient handles reconnection automatically. Duplicate events delivered during reconnection are deduplicated by message ID. No manual intervention is needed.

## After Setup

The Feishu channel supports:
- **Group chats** — Bot responds to @mentions (or all messages if `requiresTrigger: false`)
- **Direct messages** — Users can DM the bot directly
- **Multi-channel** — Can run alongside WhatsApp, Telegram, Slack (auto-enabled by credentials)
- **Message types** — Text and rich text (post) messages are fully handled; images, files, audio, and video show a descriptive placeholder

## Known Limitations

- **No typing indicator** — Feishu's Bot API does not expose a typing indicator endpoint. The `setTyping()` method is a no-op.
- **Text replies only** — The bot sends plain text responses. Rich text (post), interactive cards, and image replies are not implemented.
- **Message splitting is naive** — Long messages are split at a fixed 4000-character boundary, which may break mid-word. A smarter split on paragraph or sentence boundaries would improve readability.
- **App review required** — Feishu self-built apps must be published and approved before receiving messages. Internal enterprise apps are usually auto-approved; Lark (international) may have additional review steps.
- **Contact scope may require admin approval** — The `contact:user.base:readonly` permission for resolving user names sometimes needs enterprise admin approval. Without it, user names fall back to `open_id`.
