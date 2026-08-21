import { logger } from './logger.js';

export const SECURITY_BOUNDARIES = [
  'channel_registration',
  'sender_allowlist',
  'ipc_authorization',
  'container_policy',
  'container_mount',
  'credential_broker',
] as const;

export const SECURITY_CHANNELS = [
  'dingtalk',
  'feishu',
  'qq',
  'internal',
  'unknown',
] as const;

export const SECURITY_GROUP_CLASSES = [
  'main',
  'non_main',
  'group',
  'direct',
  'unknown',
] as const;

export const SECURITY_REASON_CODES = [
  'unregistered_remote',
  'remote_privilege_command',
  'sender_not_allowed',
  'cross_group_message',
  'target_not_registered',
  'cross_group_task',
  'task_not_owned',
  'main_required',
  'unsafe_group_folder',
  'missing_required_fields',
  'unknown_operation',
  'privilege_mismatch',
  'invalid_container_config',
  'invalid_policy_path',
  'invalid_skill_manifest',
  'invalid_skill_name',
  'approved_skill_missing',
  'duplicate_mount_destination',
  'skill_symlink',
  'allowlist_missing',
  'invalid_container_path',
  'host_path_missing',
  'blocked_host_path',
  'outside_allowlist',
  'invalid_capability',
  'path_not_allowed',
  'invalid_reason_code',
] as const;

export type SecurityBoundary = (typeof SECURITY_BOUNDARIES)[number];
export type SecurityChannel = (typeof SECURITY_CHANNELS)[number];
export type SecurityGroupClass = (typeof SECURITY_GROUP_CLASSES)[number];
export type SecurityReasonCode = (typeof SECURITY_REASON_CODES)[number];

export interface SecurityBoundaryDenialInput {
  boundary: SecurityBoundary;
  channel: SecurityChannel;
  groupClass: SecurityGroupClass;
  reasonCode: SecurityReasonCode | string;
}

export interface SecurityBoundaryDenialRecord {
  event: 'security_boundary_denied';
  boundary: SecurityBoundary;
  channel: SecurityChannel;
  group_class: SecurityGroupClass;
  reason_code: SecurityReasonCode;
}

const reasonCodes = new Set<string>(SECURITY_REASON_CODES);

export function createSecurityBoundaryDenialRecord(
  input: SecurityBoundaryDenialInput,
): SecurityBoundaryDenialRecord {
  const reasonCode = reasonCodes.has(input.reasonCode)
    ? (input.reasonCode as SecurityReasonCode)
    : 'invalid_reason_code';
  return {
    event: 'security_boundary_denied',
    boundary: input.boundary,
    channel: input.channel,
    group_class: input.groupClass,
    reason_code: reasonCode,
  };
}

export function logSecurityBoundaryDenied(
  input: SecurityBoundaryDenialInput,
): void {
  logger.warn(
    createSecurityBoundaryDenialRecord(input),
    'Security boundary denied',
  );
}

export function securityChannelFromJid(jid: string): SecurityChannel {
  const prefix = jid.split(':', 1)[0]?.toLowerCase();
  return SECURITY_CHANNELS.includes(prefix as SecurityChannel) &&
    prefix !== 'internal' &&
    prefix !== 'unknown'
    ? (prefix as SecurityChannel)
    : 'unknown';
}
