import fs from 'fs';
import os from 'os';
import path from 'path';
import { createHash } from 'crypto';
import { afterEach, describe, expect, it } from 'vitest';

import {
  AgentControlPlaneError,
  assertUniqueMountDestinations,
  CLAUDE_RUNTIME_STATE_DIRS,
  prepareAgentControlPlane,
} from './agent-control-plane.js';

const tempDirs: string[] = [];

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'medclaw-policy-'));
  tempDirs.push(root);
  const dataDir = path.join(root, 'data');
  const skillsSourceDir = path.join(root, 'skills');
  const allowlistFile = path.join(root, 'skills-allowlist.txt');
  const approvedDir = path.join(skillsSourceDir, 'approved-medical');
  fs.mkdirSync(approvedDir, { recursive: true });
  fs.writeFileSync(
    path.join(approvedDir, 'SKILL.md'),
    '---\nname: approved-medical\n---\nSafe instructions\n',
  );
  fs.writeFileSync(allowlistFile, 'approved-medical\n');
  return { allowlistFile, dataDir, root, skillsSourceDir };
}

function policyHash(paths: {
  hooksDir: string;
  settingsFile: string;
  skillsDir: string;
}): string {
  const skillFile = path.join(paths.skillsDir, 'approved-medical', 'SKILL.md');
  return createHash('sha256')
    .update(fs.readFileSync(paths.settingsFile))
    .update(JSON.stringify(fs.readdirSync(paths.hooksDir)))
    .update(fs.readFileSync(skillFile))
    .digest('hex');
}

afterEach(() => {
  for (const directory of tempDirs.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe('agent control plane', () => {
  it('reasserts settings, empty hooks and approved skills without deleting session state', () => {
    const fixture = makeFixture();
    const sessionFile = path.join(
      fixture.dataDir,
      'sessions',
      'registered-group',
      '.claude',
      'projects',
      'session.jsonl',
    );
    fs.mkdirSync(path.dirname(sessionFile), { recursive: true });
    fs.writeFileSync(sessionFile, 'session-state');

    const first = prepareAgentControlPlane({
      ...fixture,
      groupFolder: 'registered-group',
    });
    const expectedPolicyHash = policyHash(first);
    const expectedSettings = fs.readFileSync(first.settingsFile, 'utf-8');
    const approvedSkillFile = path.join(
      first.skillsDir,
      'approved-medical',
      'SKILL.md',
    );
    const expectedSkill = fs.readFileSync(approvedSkillFile, 'utf-8');

    fs.writeFileSync(first.settingsFile, '{"hooks":{"malicious":true}}');
    fs.writeFileSync(path.join(first.hooksDir, 'persist.sh'), 'malicious');
    fs.writeFileSync(approvedSkillFile, 'malicious');
    fs.mkdirSync(path.join(first.skillsDir, 'stale-skill'));

    const second = prepareAgentControlPlane({
      ...fixture,
      groupFolder: 'registered-group',
    });

    expect(policyHash(second)).toBe(expectedPolicyHash);
    expect(fs.readFileSync(second.settingsFile, 'utf-8')).toBe(
      expectedSettings,
    );
    expect(fs.readdirSync(second.hooksDir)).toEqual([]);
    expect(fs.readFileSync(approvedSkillFile, 'utf-8')).toBe(expectedSkill);
    expect(fs.readdirSync(second.skillsDir)).toEqual(['approved-medical']);
    expect(fs.readFileSync(sessionFile, 'utf-8')).toBe('session-state');
    for (const directory of CLAUDE_RUNTIME_STATE_DIRS) {
      expect(
        fs.statSync(path.join(second.rootDir, directory)).isDirectory(),
      ).toBe(true);
    }
  });

  it('rejects traversal in the approved-skill allowlist', () => {
    const fixture = makeFixture();
    fs.writeFileSync(fixture.allowlistFile, '../outside\n');

    expect(() =>
      prepareAgentControlPlane({
        ...fixture,
        groupFolder: 'registered-group',
      }),
    ).toThrowError(
      expect.objectContaining<Partial<AgentControlPlaneError>>({
        reasonCode: 'invalid_skill_name',
      }),
    );
  });

  it('rejects symlinks inside an approved skill', () => {
    const fixture = makeFixture();
    fs.symlinkSync(
      path.join(fixture.root, 'outside-secret'),
      path.join(fixture.skillsSourceDir, 'approved-medical', 'escape'),
    );

    expect(() =>
      prepareAgentControlPlane({
        ...fixture,
        groupFolder: 'registered-group',
      }),
    ).toThrowError(
      expect.objectContaining<Partial<AgentControlPlaneError>>({
        reasonCode: 'skill_symlink',
      }),
    );
  });

  it('rejects duplicate container mount destinations', () => {
    expect(() =>
      assertUniqueMountDestinations([
        { containerPath: '/workspace/extra/evidence' },
        { containerPath: '/workspace/extra/evidence' },
      ]),
    ).toThrowError(
      expect.objectContaining<Partial<AgentControlPlaneError>>({
        reasonCode: 'duplicate_mount_destination',
      }),
    );
  });
});
