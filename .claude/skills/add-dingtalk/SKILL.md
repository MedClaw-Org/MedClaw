---
name: add-dingtalk
description: Add DingTalk (钉钉) as a channel using Stream Mode. No public URL needed. Supports group and direct message conversations with self-registration commands.
---

# Add DingTalk Channel

This skill adds DingTalk (钉钉) support to NanoClaw using the official Stream Mode SDK, then walks through interactive setup.

## Phase 1: Pre-flight

### Check if already applied

Read `.nanoclaw/state.yaml`. If `dingtalk` is in `applied_skills`, skip to Phase 3 (Setup). The code changes are already in place.

### Ask the user

**Do they already have a DingTalk app configured?** If yes, collect the Client ID and Client Secret now. If no, we'll create one in Phase 3.

## Phase 2: Apply Code Changes

Run the skills engine to apply this skill's code package. The package files are in this directory alongside this SKILL.md.

### Initialize skills system (if needed)

If `.nanoclaw/` directory doesn't exist yet:

```bash
npx tsx scripts/apply-skill.ts --init
```

### Apply the skill

```bash
npx tsx scripts/apply-skill.ts .claude/skills/add-dingtalk
```

This deterministically:
- Adds `src/channels/dingtalk.ts` (DingTalkChannel class with self-registration via `registerChannel`)
- Adds `src/channels/dingtalk.test.ts` (unit tests)
- Appends `import './dingtalk.js'` to the channel barrel file `src/channels/index.ts`
- Installs `dingtalk-stream` and `axios` npm dependencies
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

### Create DingTalk App (if needed)

1. Go to [DingTalk Developer Console](https://open-dev.dingtalk.com/)
2. Create a new **Enterprise Internal App** (企业内部应用)
3. Go to **Application Capabilities** → **Add Capability** → **Robot (机器人)**
4. Fill in bot information and select **Stream Mode** for message receiving
5. Publish the app
6. Go to **App Credentials** and copy:
   - **Client ID** (AppKey) — looks like `ding7kjnoaiur7ofnm23`
   - **Client Secret** (AppSecret)

### Configure environment

Add to `.env`:

```bash
DINGTALK_CLIENT_ID=ding7kjnoaiur7ofnm23
DINGTALK_CLIENT_SECRET=your_client_secret_here
```

Channels auto-enable when their credentials are present — no extra configuration needed.

Sync to container environment:

```bash
mkdir -p data/env && cp .env data/env/env
```

### Build and restart

```bash
npm run build
launchctl kickstart -k gui/$(id -u)/com.nanoclaw
```

## Phase 4: Registration

### Get Conversation ID

Tell the user:

> 1. Add the bot to a DingTalk group (or start a direct message with it)
> 2. Send `/chatid` in that conversation
> 3. The bot will reply with the conversation ID (format: `dingtalk:xxxx`) and registration status

### Self-Registration (Recommended)

Users can register groups directly from the chat:

```
/register 名称|文件夹|触发器
```

Example: `/register 我的群|my_group|@Andy`

The bot will validate inputs, create the group folder with CLAUDE.md, and register in the database. Registration sets `requiresTrigger: false` — all messages are routed without needing a trigger.

### Manual Registration

For a main conversation (responds to all messages):

```typescript
registerGroup("dingtalk:<conversation-id>", {
  name: "<conversation-name>",
  folder: "dingtalk_main",
  trigger: `@${ASSISTANT_NAME}`,
  added_at: new Date().toISOString(),
  requiresTrigger: false,
  isMain: true,
});
```

## Available Commands

Commands that work even for unregistered conversations:

| Command | Alias | Description |
|---------|-------|-------------|
| `/chatid` | `！chatid` | Show conversation ID and registration status |
| `/register` | `！register` | Show registration help |
| `/register 名称\|文件夹\|触发器` | `！register ...` | Self-register the conversation |
| `/ping` | `！ping` | Check if bot is online |

Commands for registered conversations only:

| Command | Alias | Description |
|---------|-------|-------------|
| `/set-main` | `！设置主群` | Set as main group (requires confirmation) |
| `/set-main-confirm` | `！确认设置主群` | Confirm setting as main |
| `/unset-main` | `！取消主群` | Remove main group status (requires confirmation) |
| `/unset-main-confirm` | `！确认取消主群` | Confirm removing main status |
| `/cancel` | `！取消` | Cancel pending operation |

Confirmation commands expire after **60 seconds**.

## Phase 5: Verify

### Test the connection

Tell the user:

> Send a message in your registered DingTalk conversation:
> - For main conversation: Any message works
> - For non-main: Include your trigger word (e.g. `@Andy hello`)
>
> The bot should respond within a few seconds.

### Check logs if needed

```bash
tail -f logs/nanoclaw.log
```

## Troubleshooting

### Bot not responding

1. Check `DINGTALK_CLIENT_ID` and `DINGTALK_CLIENT_SECRET` are set in `.env` AND synced to `data/env/env`
2. Check conversation is registered: `sqlite3 store/messages.db "SELECT * FROM registered_groups WHERE jid LIKE 'dingtalk:%'"`
3. Verify the bot is added to the conversation in DingTalk
4. Service is running: `launchctl list | grep nanoclaw`

### Stream connection issues

The DingTalk Stream SDK uses WebSocket. Check:
1. Network connectivity to DingTalk servers
2. Credentials are correct (Client ID and Secret)
3. Bot is published and the Stream Mode capability is enabled in DingTalk Developer Console

### `/chatid` not responding

- Verify the bot is added to the conversation
- Check logs for connection errors: `tail -f logs/nanoclaw.log`
- Ensure the service is running

## Known Limitations

- **No typing indicator** — DingTalk Stream API doesn't expose a typing indicator. `setTyping()` is a no-op.
- **Text replies only** — The bot sends plain text. Rich message types (Markdown cards, ActionCard) are not implemented.
- **Session webhook required for replies** — The bot can only reply to conversations it has received a message from (the session webhook is stored per conversation). If the service restarts, the webhook map is cleared and the bot cannot proactively send until a new message arrives.
- **1s startup delay** — The Stream SDK doesn't emit a connect event, so a 1-second delay is used to ensure the WebSocket is ready before resolving `connect()`.
