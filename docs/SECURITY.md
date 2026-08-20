# MedClaw Security and Data Model

## Trust Model

| Entity | Trust Level | Rationale |
|--------|-------------|-----------|
| Main group | Trusted | Explicitly selected by the host operator; has administrative visibility |
| Non-main groups | Untrusted | Other users may be malicious |
| Container agents | Sandboxed | Isolated execution environment |
| Messaging input | User input | Potential prompt injection, including from registered chats |

## Security Boundaries

### 1. Container Isolation (Primary Boundary)

Agents execute in containers (lightweight Linux VMs), providing:
- **Process isolation** - Container processes are separated from the host except for explicit mounts, IPC, and network access
- **Filesystem isolation** - Only explicitly mounted directories are visible
- **Non-root execution** - Runs as unprivileged `node` user (uid 1000)
- **Ephemeral containers** - Fresh environment per invocation (`--rm`)

This is the primary security boundary. Rather than relying on application-level permission checks, the attack surface is limited by what's mounted.

The container is not a confidentiality boundary against the model provider or the public internet. Agents have unrestricted outbound network access.

### 2. Mount Security

**External Allowlist** - Mount permissions stored at `~/.config/nanoclaw/mount-allowlist.json`, which is:
- Outside project root
- Never mounted into containers
- Cannot be modified by agents

**Default Blocked Patterns:**
```
.ssh, .gnupg, .aws, .azure, .gcloud, .kube, .docker,
credentials, .env, .netrc, .npmrc, id_rsa, id_ed25519,
private_key, .secret
```

**Protections:**
- Symlink resolution before validation (prevents traversal attacks)
- Container path validation (rejects `..` and absolute paths)
- `nonMainReadOnly` option forces read-only for non-main groups

**Read-Only Project Root:**

The main group's project root is mounted read-only. Writable paths the agent needs (group folder, IPC, `.claude/`) are mounted separately. This prevents the agent from modifying host application code (`src/`, `dist/`, `package.json`, etc.) which would bypass the sandbox entirely on next restart.

### 3. Session Isolation

Each group has isolated Claude sessions at `data/sessions/{group}/.claude/`:
- Groups cannot see other groups' conversation history
- Session data includes full message history and file contents read
- Prevents cross-group information disclosure

### 4. IPC Authorization

Messages and task operations are verified against group identity:

| Operation | Main Group | Non-Main Group |
|-----------|------------|----------------|
| Send message to own chat | ✓ | ✓ |
| Send message to other chats | ✓ | ✗ |
| Schedule task for self | ✓ | ✓ |
| Schedule task for others | ✓ | ✗ |
| View all tasks | ✓ | Own only |
| Manage other groups | ✓ | ✗ |

Group registration and `main` privilege changes are local host operations. Chat commands cannot register themselves or grant/revoke `main`. The database enforces at most one main group.

### 5. Credential Handling

Claude credentials are selected from `.env`, sent to the container over stdin, and supplied to the Claude Agent SDK process. They are not bind-mounted as a file.

**NOT Mounted:**
- WhatsApp session (`store/auth/`) - host only
- Mount allowlist - external, never mounted
- Any credentials matching blocked patterns

Before every Bash tool call, MedClaw removes these variables from that subprocess environment:
```typescript
const secretVars = [
  'CLAUDE_CODE_OAUTH_TOKEN',
  'ANTHROPIC_API_KEY',
  'ANTHROPIC_AUTH_TOKEN',
];
```

> **Residual risk:** the Claude process must possess a credential to authenticate, and agent tools run in the same container with unrestricted network access. The Bash filter reduces accidental disclosure but is not a complete secret-isolation boundary. Treat registered chats, installed skills, and model/tool instructions as trusted code paths; rotate a credential if exposure is suspected.

### 6. Health Data Flow and Retention

- Inbound and outbound content passes through the configured messaging provider.
- Prompts, tool results, and responses are processed by Anthropic under the operator's account and provider terms.
- Web and medical skills may send query content to their documented third-party APIs.
- Registered-chat messages are stored in `store/messages.db`.
- Claude session transcripts and files read during a session may be stored under `data/sessions/{group}/.claude/` and `groups/{group}/`.
- These local files are not encrypted by MedClaw and have no automatic retention or deletion schedule. Host filesystem encryption, backups, access control, retention, and deletion are the operator's responsibility.
- MedClaw itself does not add analytics telemetry or operate a hosted application backend.

### 7. Medical Safety Boundary

Every agent invocation receives a non-optional medical safety system prompt. It requires emergency escalation for dangerous symptoms, forbids direct prescription changes, and requires uncertainty to be stated. This reduces risk but cannot guarantee clinical correctness. MedClaw is not a medical device, clinician, or emergency service; validate consequential decisions with a qualified professional.

## Privilege Comparison

| Capability | Main Group | Non-Main Group |
|------------|------------|----------------|
| Project root access | `/workspace/project` (ro) | None |
| Group folder | `/workspace/group` (rw) | `/workspace/group` (rw) |
| Global memory | Implicit via project | `/workspace/global` (ro) |
| Additional mounts | Configurable | Read-only unless allowed |
| Network access | Unrestricted | Unrestricted |
| MCP tools | All | All |

## Security Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        UNTRUSTED ZONE                             │
│  Messaging Input (potentially malicious)                         │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼ Trigger check, input escaping
┌──────────────────────────────────────────────────────────────────┐
│                     HOST PROCESS (TRUSTED)                        │
│  • Message routing                                                │
│  • IPC authorization                                              │
│  • Mount validation (external allowlist)                          │
│  • Container lifecycle                                            │
│  • Credential filtering                                           │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼ Explicit mounts only
┌──────────────────────────────────────────────────────────────────┐
│                CONTAINER (ISOLATED/SANDBOXED)                     │
│  • Agent execution                                                │
│  • Bash commands (sandboxed)                                      │
│  • File operations (limited to mounts)                            │
│  • Network access (unrestricted)                                  │
│  • Cannot modify security config                                  │
└──────────────────────────────────────────────────────────────────┘
```
