# NanoClaw Skills 技能手册

所有可用 Skills 的完整列表。在 Claude Code CLI 中使用 `/技能名称` 调用任意技能。

---

## 消息渠道

| 技能 | 命令 | 说明 |
|------|------|------|
| WhatsApp | `/add-whatsapp` | 添加 WhatsApp 频道。可以完全替代其他频道，也可与其他频道并行运行。支持二维码或配对码认证。 |
| Telegram | `/add-telegram` | 添加 Telegram 频道。可完全替代 WhatsApp，也可并行运行。支持配置为纯控制频道（触发操作）或被动频道（仅接收通知）。 |
| Slack | `/add-slack` | 添加 Slack 频道。可完全替代 WhatsApp 或并行运行。使用 Socket Mode，无需公网 URL。 |
| Discord | `/add-discord` | 添加 Discord 频道。使用 discord.js 库和 Bot Token 接入。 |
| Gmail | `/add-gmail` | 添加 Gmail 集成。可配置为工具模式（由 WhatsApp 触发读取/发送邮件）或完整频道模式（邮件可触发 Agent、调度任务并接收回复）。包含 GCP OAuth 配置引导。 |
| 飞书 / Lark | `/add-feishu` | 添加飞书（Feishu/Lark）频道。使用 WebSocket 长连接模式，无需公网 URL 或 Webhook。 |
| 钉钉 | `/add-dingtalk` | 添加钉钉（DingTalk）频道，使用 Stream Mode。无需公网 URL。支持群聊和单聊，内置群组自注册命令。 |

---

## AI 集成

| 技能 | 命令 | 说明 |
|------|------|------|
| Parallel AI | `/add-parallel` | 添加 Parallel AI MCP 集成，提供高级网络研究能力。 |
| Ollama | `/add-ollama-tool` | 添加 Ollama MCP 服务，让容器 Agent 可以调用本地模型处理摘要、翻译、通用查询等低成本任务。 |
| Claude API | `/claude-api` | 使用 Claude API 或 Anthropic SDK 构建应用。当代码导入 `anthropic` / `@anthropic-ai/sdk` / `claude_agent_sdk` 时自动触发。 |

---

## 功能扩展

| 技能 | 命令 | 说明 |
|------|------|------|
| 语音转文字 | `/add-voice-transcription` | 使用 OpenAI Whisper API 为 NanoClaw 添加语音消息转录功能，自动转录 WhatsApp 语音消息供 Agent 读取和回复。 |
| 本地 Whisper | `/use-local-whisper` | 切换到本地语音转录，替代 OpenAI Whisper API。使用运行在 Apple Silicon 上的 whisper.cpp，目前仅支持 WhatsApp。需先应用 voice-transcription 技能。 |
| Telegram Agent Swarm | `/add-telegram-swarm` | 为 Telegram 添加 Agent 团队（Swarm）支持，每个子 Agent 在群组中拥有独立的 Bot 身份。需先配置 Telegram 频道。 |
| X / Twitter | `/x-integration` | X（Twitter）集成。支持发推、点赞、回复、转推、引用转推等操作。 |

---

## 系统管理

| 技能 | 命令 | 说明 |
|------|------|------|
| 初始化配置 | `/setup` | 运行 NanoClaw 初始配置。适用于安装依赖、认证消息频道、注册主频道、启动后台服务等首次配置场景。 |
| 调试 | `/debug` | 调试容器 Agent 问题。涵盖日志、环境变量、挂载、认证问题及常见故障排查。 |
| 自定义 | `/customize` | 添加新功能或修改 NanoClaw 行为。适用于添加频道、修改触发器、添加集成、修改路由器等场景。交互式执行，会询问用户需求。 |
| 更新 NanoClaw | `/update-nanoclaw` | 高效地将上游 NanoClaw 更新合并到自定义安装中，支持预览、选择性 cherry-pick，Token 消耗低。 |
| Apple Container | `/convert-to-apple-container` | 从 Docker 切换到 Apple Container，获得 macOS 原生容器隔离能力。 |

---

## 代码质量

| 技能 | 命令 | 说明 |
|------|------|------|
| 简化代码 | `/simplify` | 审查已修改的代码，检查复用性、质量和效率，并修复发现的问题。 |
| Qodo 规范 | `/get-qodo-rules` | 在代码任务开始前从 Qodo 加载组织和仓库级别的编码规范，确保所有生成和修改均符合团队标准。 |
| Qodo PR 修复 | `/qodo-pr-resolver` | 使用 Qodo 审查并修复 PR 问题，支持交互式或批量修复（GitHub、GitLab、Bitbucket、Azure DevOps）。 |
| 快捷键配置 | `/keybindings-help` | 自定义键盘快捷键、重新绑定按键、添加组合键，或修改 `~/.claude/keybindings.json`。 |
