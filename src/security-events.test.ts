import { beforeEach, describe, expect, it, vi } from 'vitest';

const loggerRef = vi.hoisted(() => ({ warn: vi.fn() }));
vi.mock('./logger.js', () => ({ logger: loggerRef }));

import {
  createSecurityBoundaryDenialRecord,
  logSecurityBoundaryDenied,
  securityChannelFromJid,
} from './security-events.js';

const canaries = {
  sender: 'SENDER_CANARY',
  message: 'MESSAGE_CANARY',
  prompt: 'PROMPT_CANARY',
  result: 'RESULT_CANARY',
  token: 'TOKEN_CANARY',
  rawCredential: 'RAW_CREDENTIAL_CANARY',
};

describe('security denial telemetry', () => {
  beforeEach(() => vi.clearAllMocks());

  it('emits the exact stable schema and drops content-bearing extra fields', () => {
    logSecurityBoundaryDenied({
      boundary: 'ipc_authorization',
      channel: 'internal',
      groupClass: 'non_main',
      reasonCode: 'main_required',
      ...canaries,
    } as Parameters<typeof logSecurityBoundaryDenied>[0]);

    expect(loggerRef.warn).toHaveBeenCalledWith(
      {
        event: 'security_boundary_denied',
        boundary: 'ipc_authorization',
        channel: 'internal',
        group_class: 'non_main',
        reason_code: 'main_required',
      },
      'Security boundary denied',
    );
    const serialized = JSON.stringify(loggerRef.warn.mock.calls);
    for (const canary of Object.values(canaries)) {
      expect(serialized).not.toContain(canary);
    }
  });

  it('does not echo an unknown dynamic reason or a JID suffix', () => {
    const dynamicCanary = 'DYNAMIC_REASON_CANARY';
    expect(
      createSecurityBoundaryDenialRecord({
        boundary: 'credential_broker',
        channel: 'internal',
        groupClass: 'unknown',
        reasonCode: dynamicCanary,
      }),
    ).toMatchObject({ reason_code: 'invalid_reason_code' });
    expect(
      JSON.stringify(
        createSecurityBoundaryDenialRecord({
          boundary: 'credential_broker',
          channel: 'internal',
          groupClass: 'unknown',
          reasonCode: dynamicCanary,
        }),
      ),
    ).not.toContain(dynamicCanary);
    expect(securityChannelFromJid('feishu:IDENTIFIER_CANARY')).toBe('feishu');
    expect(securityChannelFromJid('custom:IDENTIFIER_CANARY')).toBe('unknown');
  });
});
