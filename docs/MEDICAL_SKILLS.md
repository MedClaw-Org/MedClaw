# NanoClaw Skills Reference

A complete list of available skills. Invoke any skill with `/skill-name` in the Claude Code CLI.

---

## Messaging Channels

| Skill | Command | Description |
|-------|---------|-------------|
| WhatsApp | `/add-whatsapp` | Add WhatsApp as a channel. Can replace other channels entirely or run alongside them. Uses QR code or pairing code for authentication. |
| Telegram | `/add-telegram` | Add Telegram as a channel. Can replace WhatsApp entirely or run alongside it. Also configurable as a control-only channel (triggers actions) or passive channel (receives notifications only). |
| Slack | `/add-slack` | Add Slack as a channel. Can replace WhatsApp entirely or run alongside it. Uses Socket Mode (no public URL needed). |
| Discord | `/add-discord` | Add Discord as a channel. Uses the discord.js library with a bot token. |
| Gmail | `/add-gmail` | Add Gmail integration. Can be configured as a tool (agent reads/sends emails when triggered from WhatsApp) or as a full channel (emails can trigger the agent, schedule tasks, and receive replies). Guides through GCP OAuth setup and implements the integration. |
| Feishu / Lark | `/add-feishu` | Add Feishu (飞书/Lark) as a channel. Uses WebSocket long connection mode — no public URL or webhook needed. |
| DingTalk | `/add-dingtalk` | Add DingTalk (钉钉) as a channel using Stream Mode. No public URL needed. Supports group and direct message conversations with self-registration commands. |

---

## AI Integrations

| Skill | Command | Description |
|-------|---------|-------------|
| Parallel AI | `/add-parallel` | Add Parallel AI MCP integration for advanced web research capabilities. |
| Ollama | `/add-ollama-tool` | Add Ollama MCP server so the container agent can call local models for cheaper/faster tasks like summarization, translation, or general queries. |
| Claude API | `/claude-api` | Build apps with the Claude API or Anthropic SDK. Triggered when code imports `anthropic` / `@anthropic-ai/sdk` / `claude_agent_sdk`. |

---

## Feature Extensions

| Skill | Command | Description |
|-------|---------|-------------|
| Voice Transcription | `/add-voice-transcription` | Add voice message transcription to NanoClaw using OpenAI's Whisper API. Automatically transcribes WhatsApp voice notes so the agent can read and respond to them. |
| Local Whisper | `/use-local-whisper` | Switch to local voice transcription instead of OpenAI Whisper API. Uses whisper.cpp running on Apple Silicon. WhatsApp only. Requires voice-transcription skill to be applied first. |
| Telegram Agent Swarm | `/add-telegram-swarm` | Add Agent Swarm (Teams) support to Telegram. Each subagent gets its own bot identity in the group. Requires Telegram channel to be set up first. |
| X / Twitter | `/x-integration` | X (Twitter) integration for NanoClaw. Post tweets, like, reply, retweet, and quote. |

---

## System Management

| Skill | Command | Description |
|-------|---------|-------------|
| Setup | `/setup` | Run initial NanoClaw setup. Use when installing dependencies, authenticating messaging channels, registering the main channel, or starting background services. |
| Debug | `/debug` | Debug container agent issues. Covers logs, environment variables, mounts, authentication problems, and common failure modes. |
| Customize | `/customize` | Add new capabilities or modify NanoClaw behavior. Use when adding channels, changing triggers, adding integrations, or modifying the router. Interactive — asks questions to understand what you want. |
| Update NanoClaw | `/update-nanoclaw` | Efficiently bring upstream NanoClaw updates into a customized install, with preview, selective cherry-pick, and low token usage. |
| Apple Container | `/convert-to-apple-container` | Switch from Docker to Apple Container for macOS-native container isolation. |

---

## Code Quality

| Skill | Command | Description |
|-------|---------|-------------|
| Simplify | `/simplify` | Review changed code for reuse, quality, and efficiency, then fix any issues found. |
| Qodo Rules | `/get-qodo-rules` | Load org- and repo-level coding rules from Qodo before code tasks begin, ensuring all generation and modification follows team standards. |
| Qodo PR Resolver | `/qodo-pr-resolver` | Review and resolve PR issues with Qodo — get AI-powered code review issues and fix them interactively (GitHub, GitLab, Bitbucket, Azure DevOps). |
| Keybindings | `/keybindings-help` | Customize keyboard shortcuts, rebind keys, add chord bindings, or modify `~/.claude/keybindings.json`. |
