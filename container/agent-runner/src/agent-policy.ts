import type { Options } from '@anthropic-ai/claude-agent-sdk';

const MAIN_TOOLS = [
  'Bash',
  'Read',
  'Write',
  'Edit',
  'Glob',
  'Grep',
  'WebSearch',
  'WebFetch',
  'Task',
  'TaskOutput',
  'TaskStop',
  'TeamCreate',
  'TeamDelete',
  'SendMessage',
  'TodoWrite',
  'ToolSearch',
  'Skill',
  'NotebookEdit',
] as const;

const NON_MAIN_TOOLS = [
  'Read',
  'Write',
  'Edit',
  'Glob',
  'Grep',
  'WebSearch',
  'WebFetch',
  'Skill',
] as const;

export const NON_MAIN_FORBIDDEN_TOOLS = [
  'Bash',
  'NotebookEdit',
  'Task',
  'TaskOutput',
  'TaskStop',
  'TeamCreate',
  'TeamDelete',
  'SendMessage',
  'TodoWrite',
  'ToolSearch',
] as const;

export type AgentPolicy = Pick<
  Options,
  | 'allowedTools'
  | 'allowDangerouslySkipPermissions'
  | 'disallowedTools'
  | 'permissionMode'
  | 'settingSources'
  | 'tools'
>;

export function buildAgentPolicy(isMain: boolean): AgentPolicy {
  const tools = isMain ? [...MAIN_TOOLS] : [...NON_MAIN_TOOLS];

  return {
    // `allowedTools` auto-approves tools; it is not a restriction. `tools` is
    // the actual built-in capability boundary in the current Agent SDK.
    tools,
    allowedTools: [...tools, 'mcp__nanoclaw__*'],
    disallowedTools: isMain ? [] : [...NON_MAIN_FORBIDDEN_TOOLS],
    permissionMode: 'bypassPermissions',
    allowDangerouslySkipPermissions: true,
    // Non-main group memory is appended explicitly by the runner. Omitting
    // project/local settings prevents writable group `.claude` policy injection.
    settingSources: isMain ? ['project', 'user'] : ['user'],
  };
}
