import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import { PassThrough } from 'stream';

const brokerRef = vi.hoisted(() => {
  const close = vi.fn(async () => {});
  return {
    close,
    loadProviderCredential: vi.fn(
      () =>
        null as null | {
          authKind: 'api_key';
          rawCredential: string;
          upstreamBaseUrl: string;
        },
    ),
    startProviderCredentialBroker: vi.fn(async () => ({
      close,
      containerEnv: {
        ANTHROPIC_BASE_URL: 'http://host.docker.internal:43123',
        ANTHROPIC_API_KEY: `medclaw_broker_${'a'.repeat(43)}`,
      },
      hostBaseUrl: 'http://127.0.0.1:43123',
    })),
  };
});

vi.mock('./credential-broker.js', () => ({
  loadProviderCredential: brokerRef.loadProviderCredential,
  startProviderCredentialBroker: brokerRef.startProviderCredentialBroker,
}));

// Sentinel markers must match container-runner.ts
const OUTPUT_START_MARKER = '---NANOCLAW_OUTPUT_START---';
const OUTPUT_END_MARKER = '---NANOCLAW_OUTPUT_END---';

// Mock config
vi.mock('./config.js', () => ({
  CONTAINER_IMAGE: 'nanoclaw-agent:latest',
  CONTAINER_MAX_OUTPUT_SIZE: 10485760,
  CONTAINER_TIMEOUT: 1800000, // 30min
  DATA_DIR: '/tmp/nanoclaw-test-data',
  GROUPS_DIR: '/tmp/nanoclaw-test-groups',
  IDLE_TIMEOUT: 1800000, // 30min
  TIMEZONE: 'America/Los_Angeles',
}));

// Mock logger
vi.mock('./logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fs
vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...actual,
    default: {
      ...actual,
      existsSync: vi.fn(() => false),
      mkdirSync: vi.fn(),
      writeFileSync: vi.fn(),
      chmodSync: vi.fn(),
      readFileSync: vi.fn(() => ''),
      readdirSync: vi.fn(() => []),
      statSync: vi.fn(() => ({ isDirectory: () => false })),
      copyFileSync: vi.fn(),
    },
  };
});

// Mock mount-security
vi.mock('./mount-security.js', () => ({
  validateAdditionalMounts: vi.fn(() => []),
}));

// Create a controllable fake ChildProcess
function createFakeProcess() {
  const proc = new EventEmitter() as EventEmitter & {
    stdin: PassThrough;
    stdout: PassThrough;
    stderr: PassThrough;
    kill: ReturnType<typeof vi.fn>;
    pid: number;
  };
  proc.stdin = new PassThrough();
  proc.stdout = new PassThrough();
  proc.stderr = new PassThrough();
  proc.kill = vi.fn();
  proc.pid = 12345;
  return proc;
}

let fakeProc: ReturnType<typeof createFakeProcess>;

// Mock child_process.spawn
vi.mock('child_process', async () => {
  const actual =
    await vi.importActual<typeof import('child_process')>('child_process');
  return {
    ...actual,
    spawn: vi.fn(() => fakeProc),
    exec: vi.fn(
      (_cmd: string, _opts: unknown, cb?: (err: Error | null) => void) => {
        if (cb) cb(null);
        return new EventEmitter();
      },
    ),
  };
});

import { runContainerAgent, ContainerOutput } from './container-runner.js';
import { validateAdditionalMounts } from './mount-security.js';
import type { RegisteredGroup } from './types.js';

const testGroup: RegisteredGroup = {
  name: 'Test Group',
  folder: 'test-group',
  trigger: '@Andy',
  added_at: new Date().toISOString(),
};

const testInput = {
  prompt: 'Hello',
  groupFolder: 'test-group',
  chatJid: 'test@g.us',
  isMain: false,
};

function emitOutputMarker(
  proc: ReturnType<typeof createFakeProcess>,
  output: ContainerOutput,
) {
  const json = JSON.stringify(output);
  proc.stdout.push(`${OUTPUT_START_MARKER}\n${json}\n${OUTPUT_END_MARKER}\n`);
}

describe('container-runner timeout behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    brokerRef.loadProviderCredential.mockReturnValue(null);
    vi.useFakeTimers();
    fakeProc = createFakeProcess();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('timeout after output resolves as success', async () => {
    const onOutput = vi.fn(async () => {});
    const resultPromise = runContainerAgent(
      testGroup,
      testInput,
      () => {},
      onOutput,
    );

    // Emit output with a result
    emitOutputMarker(fakeProc, {
      status: 'success',
      result: 'Here is my response',
      newSessionId: 'session-123',
    });

    // Let output processing settle
    await vi.advanceTimersByTimeAsync(10);

    // Fire the hard timeout (IDLE_TIMEOUT + 30s = 1830000ms)
    await vi.advanceTimersByTimeAsync(1830000);

    // Emit close event (as if container was stopped by the timeout)
    fakeProc.emit('close', 137);

    // Let the promise resolve
    await vi.advanceTimersByTimeAsync(10);

    const result = await resultPromise;
    expect(result.status).toBe('success');
    expect(result.newSessionId).toBe('session-123');
    expect(onOutput).toHaveBeenCalledWith(
      expect.objectContaining({ result: 'Here is my response' }),
    );
  });

  it('fails closed before spawn for a corrupt group folder', async () => {
    vi.mocked(spawn).mockClear();

    await expect(
      runContainerAgent(
        { ...testGroup, folder: '../escape' },
        { ...testInput, groupFolder: '../escape' },
        () => {},
      ),
    ).rejects.toThrow('Invalid group folder');
    expect(spawn).not.toHaveBeenCalled();
  });

  it('fails closed before spawn when requested privilege disagrees with trusted registration', async () => {
    vi.mocked(spawn).mockClear();

    await expect(
      runContainerAgent(testGroup, { ...testInput, isMain: true }, () => {}),
    ).rejects.toThrow('container_policy:privilege_mismatch');
    expect(spawn).not.toHaveBeenCalled();
  });

  it('fails closed before spawn for duplicate validated mount destinations', async () => {
    vi.mocked(spawn).mockClear();
    vi.mocked(validateAdditionalMounts).mockReturnValueOnce([
      {
        hostPath: '/tmp/evidence-a',
        containerPath: '/workspace/extra/evidence',
        readonly: true,
      },
      {
        hostPath: '/tmp/evidence-b',
        containerPath: '/workspace/extra/evidence',
        readonly: true,
      },
    ]);

    await expect(
      runContainerAgent(
        {
          ...testGroup,
          containerConfig: {
            additionalMounts: [{ hostPath: '/tmp/a' }],
          },
        },
        testInput,
        () => {},
      ),
    ).rejects.toThrow('duplicate_mount_destination');
    expect(spawn).not.toHaveBeenCalled();
  });

  it('keeps a raw provider canary out of stdin, argv and mounts', async () => {
    const rawCanary = 'sk-ant-medclaw-container-canary';
    brokerRef.loadProviderCredential.mockReturnValueOnce({
      authKind: 'api_key',
      rawCredential: rawCanary,
      upstreamBaseUrl: 'http://127.0.0.1:9',
    });

    const resultPromise = runContainerAgent(testGroup, testInput, () => {});
    await vi.waitFor(() => expect(spawn).toHaveBeenCalledTimes(1));

    const payload = fakeProc.stdin.read()?.toString() || '';
    const args = vi.mocked(spawn).mock.calls.at(-1)?.[1] as string[];
    expect(payload).not.toContain(rawCanary);
    expect(JSON.stringify(args)).not.toContain(rawCanary);
    expect(payload).toContain('medclaw_broker_');
    expect(payload).toContain('host.docker.internal');
    expect(brokerRef.startProviderCredentialBroker).toHaveBeenCalledWith(
      expect.objectContaining({ rawCredential: rawCanary }),
      { groupClass: 'non_main' },
    );

    emitOutputMarker(fakeProc, {
      status: 'success',
      result: 'synthetic broker answer',
    });
    fakeProc.emit('close', 0);
    await vi.advanceTimersByTimeAsync(10);
    await expect(resultPromise).resolves.toMatchObject({ status: 'success' });
    expect(brokerRef.close).toHaveBeenCalledOnce();
  });

  it('timeout with no output resolves as error', async () => {
    const onOutput = vi.fn(async () => {});
    const resultPromise = runContainerAgent(
      testGroup,
      testInput,
      () => {},
      onOutput,
    );

    // No output emitted — fire the hard timeout
    await vi.advanceTimersByTimeAsync(1830000);

    // Emit close event
    fakeProc.emit('close', 137);

    await vi.advanceTimersByTimeAsync(10);

    const result = await resultPromise;
    expect(result.status).toBe('error');
    expect(result.error).toContain('timed out');
    expect(onOutput).not.toHaveBeenCalled();
  });

  it('normal exit after output resolves as success', async () => {
    const onOutput = vi.fn(async () => {});
    const resultPromise = runContainerAgent(
      testGroup,
      testInput,
      () => {},
      onOutput,
    );

    // Emit output
    emitOutputMarker(fakeProc, {
      status: 'success',
      result: 'Done',
      newSessionId: 'session-456',
    });

    await vi.advanceTimersByTimeAsync(10);

    // Normal exit (no timeout)
    fakeProc.emit('close', 0);

    await vi.advanceTimersByTimeAsync(10);

    const result = await resultPromise;
    expect(result.status).toBe('success');
    expect(result.newSessionId).toBe('session-456');
  });

  it('forwards partial text deltas before the terminal result', async () => {
    const onOutput = vi.fn(async () => {});
    const resultPromise = runContainerAgent(
      testGroup,
      testInput,
      () => {},
      onOutput,
    );

    emitOutputMarker(fakeProc, {
      status: 'success',
      result: null,
      streamDelta: 'partial ',
      newSessionId: 'session-stream',
    });
    emitOutputMarker(fakeProc, {
      status: 'success',
      result: 'partial answer',
      isFinalResult: true,
      newSessionId: 'session-stream',
    });
    await vi.advanceTimersByTimeAsync(10);
    fakeProc.emit('close', 0);
    await vi.advanceTimersByTimeAsync(10);

    await expect(resultPromise).resolves.toMatchObject({ status: 'success' });
    expect(onOutput).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ streamDelta: 'partial ' }),
    );
    expect(onOutput).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        result: 'partial answer',
        isFinalResult: true,
      }),
    );
  });

  it('reports a delivery callback failure instead of acknowledging output', async () => {
    const onOutput = vi.fn(async () => {
      throw new Error('messenger unavailable');
    });
    const resultPromise = runContainerAgent(
      testGroup,
      testInput,
      () => {},
      onOutput,
    );

    emitOutputMarker(fakeProc, {
      status: 'success',
      result: 'Undelivered response',
      newSessionId: 'session-789',
    });
    await vi.advanceTimersByTimeAsync(10);
    fakeProc.emit('close', 0);
    await vi.advanceTimersByTimeAsync(10);

    const result = await resultPromise;
    expect(result.status).toBe('error');
    expect(result.error).toContain('messenger unavailable');
  });

  it('never bind-mounts writable agent-runner source into /app/src', async () => {
    const resultPromise = runContainerAgent(
      testGroup,
      testInput,
      () => {},
      vi.fn(async () => {}),
    );

    const args = vi.mocked(spawn).mock.calls.at(-1)?.[1] as string[];
    expect(args.some((arg) => arg.includes(':/app/src'))).toBe(false);

    fakeProc.emit('close', 0);
    await vi.advanceTimersByTimeAsync(10);
    await expect(resultPromise).resolves.toMatchObject({ status: 'success' });
  });

  it('mounts the non-main control plane read-only with only projects mutable', async () => {
    const resultPromise = runContainerAgent(
      testGroup,
      testInput,
      () => {},
      vi.fn(async () => {}),
    );

    const args = vi.mocked(spawn).mock.calls.at(-1)?.[1] as string[];
    const policyMount =
      '/tmp/nanoclaw-test-data/policies/test-group:/home/node/.claude:ro';
    const projectsMount =
      '/tmp/nanoclaw-test-data/sessions/test-group/.claude/projects:/home/node/.claude/projects';
    const claudeMounts = args.filter((arg) =>
      arg.includes(':/home/node/.claude'),
    );

    expect(claudeMounts).toEqual([policyMount, projectsMount]);
    expect(args.indexOf(projectsMount)).toBeGreaterThan(
      args.indexOf(policyMount),
    );

    fakeProc.emit('close', 0);
    await vi.advanceTimersByTimeAsync(10);
    await expect(resultPromise).resolves.toMatchObject({ status: 'success' });
  });

  it('retains the registered main container contract with read-only project and policy mounts', async () => {
    const resultPromise = runContainerAgent(
      { ...testGroup, folder: 'main', isMain: true },
      { ...testInput, groupFolder: 'main', chatJid: 'main@g.us', isMain: true },
      () => {},
    );

    const args = vi.mocked(spawn).mock.calls.at(-1)?.[1] as string[];
    expect(args).toContain(`${process.cwd()}:/workspace/project:ro`);
    expect(args).toContain(
      '/tmp/nanoclaw-test-data/policies/main:/home/node/.claude:ro',
    );
    expect(args).toContain(
      '/tmp/nanoclaw-test-data/sessions/main/.claude/projects:/home/node/.claude/projects',
    );

    emitOutputMarker(fakeProc, {
      status: 'success',
      result: 'synthetic main answer',
      newSessionId: 'main-session',
    });
    await vi.advanceTimersByTimeAsync(10);
    fakeProc.emit('close', 0);
    await vi.advanceTimersByTimeAsync(10);

    await expect(resultPromise).resolves.toMatchObject({
      status: 'success',
      result: 'synthetic main answer',
      newSessionId: 'main-session',
    });
  });
});
