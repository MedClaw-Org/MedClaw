<p align="center">
  <img src="assets/medclaw.png" alt="MedClaw" width="300">
</p>

<h1 align="center">MedClaw</h1>

<p align="center">
  <strong>您的智能医疗助手。您的健康，您做主。</strong>
</p>

<p align="center">
  <a href="README.md">English</a>&nbsp; • &nbsp;
  <a href="docs/MEDICAL_SKILLS_zh.md">技能手册</a>
</p>

---

## 概览

MedClaw 是一款个人 AI 医疗助手，在隔离容器中安全运行 Claude 智能体。基于 [NanoClaw](https://github.com/qwibitai/nanoclaw) 构建，在核心平台之上扩展了一套医疗专业技能——涵盖生物医学数据库查询、文献检索、患者文档简化和临床备考等场景。

MedClaw 可接入您的消息渠道（飞书、WhatsApp、Telegram 等），让您的医疗助手随时触手可及。每个对话群组都在独立的容器沙箱中运行，拥有隔离的内存空间，保障您的健康数据安全私密。

**MedClaw 的特点：**
- 基于极简、可审计代码库构建的医疗专属技能集
- 智能体运行在 Linux 容器中——真正的操作系统级隔离，而非应用层权限检查
- 无遥测、无云存储、无第三方数据共享
- 完全可定制——修改代码以满足您的精确需求

---

## 快速开始

```bash
git clone https://github.com/MedClaw-Org/MedClaw.git
cd MedClaw
claude
```

然后运行 `/setup`。Claude Code 会处理一切：依赖安装、身份验证、容器设置和服务配置。

> **注意：** 以 `/` 开头的命令（如 `/setup`、`/add-feishu`）是 Claude Code 技能，请在 `claude` CLI 提示符中输入，而非在普通终端中。

### 系统要求

- macOS 或 Linux
- Node.js 20+
- [Claude Code](https://claude.ai/download)
- [Docker](https://docker.com/products/docker-desktop)（macOS/Linux）

---

## 架构

```
消息渠道（飞书 / WhatsApp / Telegram / ...）
    ↓
SQLite 消息存储
    ↓
轮询循环（src/index.ts）
    ↓
容器（Claude Agent SDK + 医疗技能）
    ↓
响应路由回消息渠道
```

单一 Node.js 进程。渠道在启动时自注册，编排器自动连接已配置凭据的渠道。智能体在 Linux 容器中执行，每个群组拥有独立的文件系统隔离。IPC 通过文件系统实现。

**关键文件：**

| 文件 | 用途 |
|------|------|
| `src/index.ts` | 编排器：状态管理、消息循环、智能体调用 |
| `src/channels/registry.ts` | 渠道注册表（启动时自注册） |
| `src/container-runner.ts` | 启动带卷挂载的智能体容器 |
| `src/router.ts` | 消息格式化与出站路由 |
| `src/task-scheduler.ts` | 运行计划任务 |
| `src/db.ts` | SQLite 操作 |
| `container/skills/` | 自动加载到每个智能体容器的医疗技能 |
| `groups/{name}/CLAUDE.md` | 各群组独立记忆 |

---

## 技能

医疗技能从 `container/skills/` 自动加载到每个智能体容器中，智能体可根据上下文无需显式命令地调用它们。

| 技能 | 说明 |
|------|------|
| agent-browser | 浏览器自动化——网页研究、截图、表单交互、数据提取 |
| find-skills | 通过技能生态发现和安装新的智能体技能 |
| pubmed-search | 通过 NCBI Entrez API 搜索 PubMed 科学文献 |
| medical-research-toolkit | 通过统一 MCP 端点查询 14+ 生物医学数据库（ChEMBL、ClinicalTrials.gov、OpenTargets、OpenFDA、OMIM、Reactome、KEGG、UniProt 等） |
| medical-specialty-briefs | 从顶级期刊生成各医学专科的每日或按需研究简报 |
| usmle | USMLE Step 1/2 CK/Step 3 备考：进度追踪、薄弱点分析、住院医匹配规划 |
| medical-entity-extractor | 从患者消息中提取症状、药物、检验值和诊断 |
| patiently-ai | 将医生信件、检查报告、处方和出院小结转化为通俗易懂的语言 |
| multi-search-engine | 17 引擎搜索（8 个国内 + 9 个国际）：百度、Google、DuckDuckGo、WolframAlpha 等 |
| wikipedia-search | 通过 MediaWiki API 获取百科全书式内容，支持多语言 |

完整技能手册：[docs/MEDICAL_SKILLS_zh.md](docs/MEDICAL_SKILLS_zh.md)

---

## 致谢

MedClaw 基于 [@qwibitai](https://github.com/qwibitai) 开发的 [NanoClaw](https://github.com/qwibitai/nanoclaw) 构建，NanoClaw 的灵感来源于 [OpenClaw](https://github.com/openclaw/openclaw)。核心架构——单进程编排器、容器隔离智能体、基于技能的可扩展性——完全来自 NanoClaw。

医疗技能来源于开放的智能体技能生态系统。各技能的版权信息请查看 `container/skills/` 下对应目录。

---

## 许可证

MIT
