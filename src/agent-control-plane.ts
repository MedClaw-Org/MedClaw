import fs from 'fs';
import path from 'path';

export interface AgentControlPlanePaths {
  hooksDir: string;
  rootDir: string;
  settingsFile: string;
  skillsDir: string;
}

export const CLAUDE_RUNTIME_STATE_DIRS = [
  'projects',
  'plans',
  'shell-snapshots',
  'tasks',
  'teams',
  'todos',
] as const;

export class AgentControlPlaneError extends Error {
  constructor(
    readonly reasonCode:
      | 'invalid_policy_path'
      | 'invalid_skill_manifest'
      | 'invalid_skill_name'
      | 'approved_skill_missing'
      | 'duplicate_mount_destination'
      | 'skill_symlink',
    detail: string,
  ) {
    super(`agent_control_plane:${reasonCode}:${detail}`);
    this.name = 'AgentControlPlaneError';
  }
}

export function assertUniqueMountDestinations(
  mounts: ReadonlyArray<{ containerPath: string }>,
): void {
  const destinations = new Set<string>();
  for (const mount of mounts) {
    if (destinations.has(mount.containerPath)) {
      throw new AgentControlPlaneError(
        'duplicate_mount_destination',
        mount.containerPath,
      );
    }
    destinations.add(mount.containerPath);
  }
}

const POLICY_SETTINGS = `${JSON.stringify(
  {
    env: {
      CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: '1',
      CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD: '1',
      CLAUDE_CODE_DISABLE_AUTO_MEMORY: '0',
    },
  },
  null,
  2,
)}\n`;

function resetDirectory(directory: string): void {
  fs.rmSync(directory, { recursive: true, force: true });
  fs.mkdirSync(directory, { recursive: true });
}

function assertNoSymlinks(root: string, skillName: string): void {
  if (fs.lstatSync(root).isSymbolicLink()) {
    throw new AgentControlPlaneError('skill_symlink', skillName);
  }

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const entryPath = path.join(root, entry.name);
    if (entry.isSymbolicLink()) {
      throw new AgentControlPlaneError(
        'skill_symlink',
        `${skillName}/${entry.name}`,
      );
    }
    if (entry.isDirectory()) assertNoSymlinks(entryPath, skillName);
  }
}

function readApprovedSkills(allowlistFile: string): string[] {
  if (!fs.existsSync(allowlistFile)) return [];

  const names = fs
    .readFileSync(allowlistFile, 'utf-8')
    .split('\n')
    .map((line) => line.replace(/#.*$/, '').trim())
    .filter(Boolean);

  for (const name of names) {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name)) {
      throw new AgentControlPlaneError('invalid_skill_name', name);
    }
  }

  return [...new Set(names)];
}

export function prepareAgentControlPlane(options: {
  allowlistFile: string;
  dataDir: string;
  groupFolder: string;
  skillsSourceDir: string;
}): AgentControlPlanePaths {
  const policyDir = path.join(options.dataDir, 'policies', options.groupFolder);
  if (fs.existsSync(policyDir) && fs.lstatSync(policyDir).isSymbolicLink()) {
    throw new AgentControlPlaneError(
      'invalid_policy_path',
      options.groupFolder,
    );
  }

  fs.mkdirSync(policyDir, { recursive: true });
  const settingsFile = path.join(policyDir, 'settings.json');
  const hooksDir = path.join(policyDir, 'hooks');
  const skillsDir = path.join(policyDir, 'skills');

  // Reassert the host-owned policy before every launch. The container receives
  // these paths as read-only overlays; mutable session files live elsewhere.
  fs.writeFileSync(settingsFile, POLICY_SETTINGS, { mode: 0o644 });
  fs.chmodSync(settingsFile, 0o644);
  resetDirectory(hooksDir);
  resetDirectory(skillsDir);
  // Docker cannot create a nested writable mountpoint under a read-only parent
  // mount. Keep empty host-owned mountpoints in the immutable policy root; the
  // runner overlays only the profile-specific runtime directories writable.
  for (const directory of CLAUDE_RUNTIME_STATE_DIRS) {
    fs.mkdirSync(path.join(policyDir, directory), { recursive: true });
  }

  for (const skillName of readApprovedSkills(options.allowlistFile)) {
    const sourceDir = path.join(options.skillsSourceDir, skillName);
    const skillFile = path.join(sourceDir, 'SKILL.md');
    if (
      !fs.existsSync(sourceDir) ||
      !fs.lstatSync(sourceDir).isDirectory() ||
      !fs.existsSync(skillFile)
    ) {
      throw new AgentControlPlaneError('approved_skill_missing', skillName);
    }

    assertNoSymlinks(sourceDir, skillName);
    const manifest = fs.readFileSync(skillFile, 'utf-8');
    if (
      manifest.startsWith('version https://git-lfs.github.com/spec/v1') ||
      !manifest.startsWith('---\n')
    ) {
      throw new AgentControlPlaneError('invalid_skill_manifest', skillName);
    }

    fs.cpSync(sourceDir, path.join(skillsDir, skillName), {
      recursive: true,
    });
  }

  return { hooksDir, rootDir: policyDir, settingsFile, skillsDir };
}
