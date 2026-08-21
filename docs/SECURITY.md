# MedClaw Security and Data Model

## Trust Model

| Entity           | Trust Level | Rationale                                                               |
| ---------------- | ----------- | ----------------------------------------------------------------------- |
| Main group       | Trusted     | Explicitly selected by the host operator; has administrative visibility |
| Non-main groups  | Untrusted   | Other users may be malicious                                            |
| Container agents | Sandboxed   | Isolated execution environment                                          |
| Messaging input  | User input  | Potential prompt injection, including from registered chats             |

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

**Read-Only Project and Agent Control Plane:**

The main group's project root is mounted read-only. The host rebuilds a separate per-group `.claude/` policy root before every launch and mounts it read-only. It contains fixed settings, empty hooks, and only skills named in the host-owned `container/skills-allowlist.txt`. Writable session state is overlaid only at explicit subdirectories: `projects` for non-main groups and `projects`, `plans`, `shell-snapshots`, `tasks`, `teams`, and `todos` for the main group. Group data and IPC remain separate writable mounts.

This prevents an agent from persisting settings, hooks, unapproved skills, or host application changes that would become capabilities on a later invocation. Symlinked or malformed skills, unsafe policy paths, and duplicate mount destinations fail before the container starts.

### 3. Session Isolation

Each group has isolated writable Claude runtime state under `data/sessions/{group}/.claude/`:

- Groups cannot see other groups' conversation history
- Session data includes full message history and file contents read
- Prevents cross-group information disclosure

### 4. IPC Authorization

Messages and task operations are verified against group identity:

| Operation                   | Main Group | Non-Main Group |
| --------------------------- | ---------- | -------------- |
| Send message to own chat    | ✓          | ✓              |
| Send message to other chats | ✓          | ✗              |
| Schedule task for self      | ✓          | ✓              |
| Schedule task for others    | ✓          | ✗              |
| View all tasks              | ✓          | Own only       |
| Manage other groups         | ✓          | ✗              |

Group registration and `main` privilege changes are local host operations. Chat commands cannot register themselves or grant/revoke `main`. The database enforces at most one main group.

### 5. Credential Handling

Raw provider credentials are loaded and retained by the trusted host process. For each container invocation, MedClaw starts a short-lived HTTP credential broker and sends the container only:

- a host-local broker base URL; and
- a random 256-bit, invocation-scoped broker capability in the SDK's expected authentication field.

The container runner removes inherited raw provider variables before starting the SDK and accepts only the broker URL plus exactly one correctly shaped capability. The broker strips client-supplied authorization headers, validates the capability and allowed provider path, and injects the raw credential only into the upstream request. It closes when the container invocation ends. Raw provider credentials are not placed in container argv, environment, stdin, mounts, or the SDK child-process environment.

**NOT Mounted:**

- WhatsApp session (`store/auth/`) - host only
- Mount allowlist - external, never mounted
- Any credentials matching blocked patterns

> **Residual risk:** the invocation capability authorizes allowed provider requests while its host broker is alive. Containers still have unrestricted outbound network access, and this design is not a Docker/kernel escape defense or a guarantee about credential handling after the upstream provider receives a request. Treat the main group and locally approved skills as trusted code paths; rotate a credential if host or provider exposure is suspected.

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

| Capability           | Main Group                                                  | Non-Main Group                                                                                                                                    |
| -------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project root access  | `/workspace/project` (ro)                                   | None                                                                                                                                              |
| Group folder         | `/workspace/group` (rw)                                     | `/workspace/group` (rw)                                                                                                                           |
| Global memory        | Implicit via project                                        | `/workspace/global` (ro)                                                                                                                          |
| Additional mounts    | Configurable                                                | Read-only unless allowed                                                                                                                          |
| Network access       | Unrestricted                                                | Unrestricted                                                                                                                                      |
| MCP tools            | All                                                         | All                                                                                                                                               |
| Built-in agent tools | Full configured profile, including Bash and task/team tools | `Read`, `Write`, `Edit`, `Glob`, `Grep`, `WebSearch`, `WebFetch`, `Skill`; no Bash, Notebook, task/team, messaging, todo, or tool-discovery tools |

## Security Verification and Denial Events

After changing container mounts, agent policy, or provider authentication, run:

```bash
npm run build
node scripts/docker-security-canary.mjs
```

The canary uses a synthetic credential and a local synthetic upstream. A passing result reports no raw-token hits in container argv, environment, stdin, readable `/proc` surfaces, or a child process; a read-only policy mount; a writable session overlay; and successful broker authentication upstream. It does not contact a real provider or perform a general container-escape penetration test.

Scoped authorization denials emit a `security_boundary_denied` record with exactly `event`, `boundary`, `channel`, `group_class`, and an allowlisted `reason_code`. The record intentionally excludes sender identity, message text, prompts, results, tokens, and raw credentials. This guarantee applies to the structured security-denial event, not to every operational or third-party log.

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
│  • Short-lived provider credential broker                         │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼ Explicit mounts + broker capability only
┌──────────────────────────────────────────────────────────────────┐
│                CONTAINER (ISOLATED/SANDBOXED)                     │
│  • Agent execution                                                │
│  • Profile-limited agent tools (non-main has no Bash/task tools)  │
│  • File operations (limited to mounts)                            │
│  • Network access (unrestricted)                                  │
│  • Cannot modify security config                                  │
└──────────────────────────────────────────────────────────────────┘
```
