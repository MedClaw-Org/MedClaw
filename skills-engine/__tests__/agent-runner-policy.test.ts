import { describe, expect, it } from 'vitest';

import {
  buildAgentPolicy,
  NON_MAIN_FORBIDDEN_TOOLS,
} from '../../container/agent-runner/src/agent-policy.js';

describe('agent runner privilege profiles', () => {
  it('uses an actual tool boundary and excludes every forbidden tool for non-main', () => {
    const policy = buildAgentPolicy(false);
    const tools = policy.tools as string[];

    expect(policy.settingSources).toEqual(['user']);
    expect(tools).toEqual(
      expect.arrayContaining([
        'Read',
        'Write',
        'Edit',
        'WebSearch',
        'WebFetch',
        'Skill',
      ]),
    );
    for (const forbidden of NON_MAIN_FORBIDDEN_TOOLS) {
      expect(tools).not.toContain(forbidden);
      expect(policy.disallowedTools).toContain(forbidden);
      expect(policy.allowedTools).not.toContain(forbidden);
    }
    expect(buildAgentPolicy(false)).toEqual(policy);
  });

  it('retains the trusted main profile and explicit local project settings', () => {
    const policy = buildAgentPolicy(true);
    const tools = policy.tools as string[];

    expect(policy.settingSources).toEqual(['project', 'user']);
    expect(tools).toEqual(
      expect.arrayContaining(['Bash', 'Task', 'TeamCreate', 'NotebookEdit']),
    );
    expect(policy.allowedTools).toContain('mcp__nanoclaw__*');
    expect(policy.disallowedTools).toEqual([]);
  });
});
