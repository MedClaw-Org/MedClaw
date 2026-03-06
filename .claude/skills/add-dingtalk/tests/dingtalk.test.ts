import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('dingtalk skill package', () => {
  const skillDir = path.resolve(__dirname, '..');

  it('has a valid manifest', () => {
    const manifestPath = path.join(skillDir, 'manifest.yaml');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const content = fs.readFileSync(manifestPath, 'utf-8');
    expect(content).toContain('skill: dingtalk');
    expect(content).toContain('version: 1.0.0');
    expect(content).toContain('dingtalk-stream');
    expect(content).toContain('axios');
  });

  it('has all files declared in adds', () => {
    const channelFile = path.join(
      skillDir,
      'add',
      'src',
      'channels',
      'dingtalk.ts',
    );
    expect(fs.existsSync(channelFile)).toBe(true);

    const content = fs.readFileSync(channelFile, 'utf-8');
    expect(content).toContain('class DingTalkChannel');
    expect(content).toContain('implements Channel');
    expect(content).toContain("registerChannel('dingtalk'");

    const testFile = path.join(
      skillDir,
      'add',
      'src',
      'channels',
      'dingtalk.test.ts',
    );
    expect(fs.existsSync(testFile)).toBe(true);

    const testContent = fs.readFileSync(testFile, 'utf-8');
    expect(testContent).toContain("describe('DingTalkChannel'");
  });

  it('has all files declared in modifies', () => {
    const indexFile = path.join(
      skillDir,
      'modify',
      'src',
      'channels',
      'index.ts',
    );
    expect(fs.existsSync(indexFile)).toBe(true);

    const indexContent = fs.readFileSync(indexFile, 'utf-8');
    expect(indexContent).toContain("import './dingtalk.js'");
  });

  it('has intent files for modified files', () => {
    expect(
      fs.existsSync(
        path.join(skillDir, 'modify', 'src', 'channels', 'index.ts.intent.md'),
      ),
    ).toBe(true);
  });

  it('has setup documentation', () => {
    expect(fs.existsSync(path.join(skillDir, 'SKILL.md'))).toBe(true);
  });

  it('dingtalk.ts implements required Channel interface methods', () => {
    const content = fs.readFileSync(
      path.join(skillDir, 'add', 'src', 'channels', 'dingtalk.ts'),
      'utf-8',
    );

    expect(content).toContain('async connect()');
    expect(content).toContain('async sendMessage(');
    expect(content).toContain('isConnected()');
    expect(content).toContain('ownsJid(');
    expect(content).toContain('async disconnect()');
    expect(content).toContain('async setTyping(');

    expect(content).toContain('readEnvFile');
    expect(content).toContain('dingtalk-stream');
    expect(content).toContain('sessionWebhooks');
    expect(content).toContain('handleRobotMessage');
  });
});
