import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('feishu skill package', () => {
  const skillDir = path.resolve(__dirname, '..');

  it('has a valid manifest', () => {
    const manifestPath = path.join(skillDir, 'manifest.yaml');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const content = fs.readFileSync(manifestPath, 'utf-8');
    expect(content).toContain('skill: feishu');
    expect(content).toContain('version: 1.0.0');
    expect(content).toContain('@larksuiteoapi/node-sdk');
  });

  it('has all files declared in adds', () => {
    const channelFile = path.join(
      skillDir,
      'add',
      'src',
      'channels',
      'feishu.ts',
    );
    expect(fs.existsSync(channelFile)).toBe(true);

    const content = fs.readFileSync(channelFile, 'utf-8');
    expect(content).toContain('class FeishuChannel');
    expect(content).toContain('implements Channel');
    expect(content).toContain("registerChannel('feishu'");

    const testFile = path.join(
      skillDir,
      'add',
      'src',
      'channels',
      'feishu.test.ts',
    );
    expect(fs.existsSync(testFile)).toBe(true);

    const testContent = fs.readFileSync(testFile, 'utf-8');
    expect(testContent).toContain("describe('FeishuChannel'");
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
    expect(indexContent).toContain("import './feishu.js'");
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

  it('feishu.ts implements required Channel interface methods', () => {
    const content = fs.readFileSync(
      path.join(skillDir, 'add', 'src', 'channels', 'feishu.ts'),
      'utf-8',
    );

    // Channel interface methods
    expect(content).toContain('async connect()');
    expect(content).toContain('async sendMessage(');
    expect(content).toContain('isConnected()');
    expect(content).toContain('ownsJid(');
    expect(content).toContain('async disconnect()');
    expect(content).toContain('async setTyping(');

    // Security pattern: reads credentials from env file
    expect(content).toContain('readEnvFile');

    // Key behaviors
    expect(content).toContain('WSClient');
    expect(content).toContain('im.message.receive_v1');
    expect(content).toContain('MAX_MESSAGE_LENGTH');
    expect(content).toContain('TRIGGER_PATTERN');
    expect(content).toContain('processedMsgIds');
    expect(content).toContain('userNameCache');
  });
});
