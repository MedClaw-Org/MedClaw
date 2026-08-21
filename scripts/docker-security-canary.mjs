#!/usr/bin/env node

import { spawn } from 'child_process';
import { randomBytes } from 'crypto';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';

import { startProviderCredentialBroker } from '../dist/credential-broker.js';

const RAW_CANARY_PREFIX = 'MEDCLAW_RAW_CANARY_';
const rawCanary = `${RAW_CANARY_PREFIX}${randomBytes(18).toString('hex')}`;
const exposeRawStdinMutant = process.argv.includes('--mutant-raw-stdin');
const tempRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), 'medclaw-docker-canary-'),
);
const policyDir = path.join(tempRoot, 'policy');
const projectsDir = path.join(tempRoot, 'projects');
fs.mkdirSync(policyDir);
fs.mkdirSync(projectsDir);
fs.mkdirSync(path.join(policyDir, 'projects'));
fs.writeFileSync(
  path.join(policyDir, 'settings.json'),
  JSON.stringify({ policy: 'host-owned' }),
);
fs.chmodSync(projectsDir, 0o777);

let upstreamSawRawCredential = false;
const upstream = http.createServer((request, response) => {
  upstreamSawRawCredential = request.headers['x-api-key'] === rawCanary;
  let body = '';
  request.setEncoding('utf8');
  request.on('data', (chunk) => {
    body += chunk;
  });
  request.on('end', () => {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ synthetic: body.includes('docker-canary') }));
  });
});

const listen = (server, host) =>
  new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, host, () => {
      server.off('error', reject);
      resolve();
    });
  });

const close = (server) =>
  new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

const runDocker = (args, stdin) =>
  new Promise((resolve, reject) => {
    const child = spawn('docker', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.once('error', reject);
    child.once('close', (code) => resolve({ code, stderr, stdout }));
    child.stdin.end(stdin);
  });

const pythonProbe = String.raw`
import errno, glob, json, os, subprocess, sys, urllib.request

marker = ('MEDCLAW_' + 'RAW_' + 'CANARY_').encode()
payload_bytes = sys.stdin.buffer.read()
payload = json.loads(payload_bytes)

def contains_marker(value):
    if isinstance(value, str):
        value = value.encode()
    return marker in value

proc_hits = []
for proc_path in glob.glob('/proc/[0-9]*'):
    for leaf in ('cmdline', 'environ'):
        candidate = os.path.join(proc_path, leaf)
        try:
            if contains_marker(open(candidate, 'rb').read()):
                proc_hits.append(candidate)
        except (OSError, PermissionError):
            pass

surface_hits = {
    'argv': contains_marker(b'\0'.join(item.encode() for item in sys.argv)),
    'env': contains_marker(b'\0'.join((key + '=' + value).encode() for key, value in os.environ.items())),
    'stdin': contains_marker(payload_bytes),
    'proc': bool(proc_hits),
}

policy_write_denied = False
try:
    open('/home/node/.claude/settings.json', 'w').write('tampered')
except OSError as error:
    policy_write_denied = error.errno in (errno.EROFS, errno.EACCES)

session_path = '/home/node/.claude/projects/canary-session.txt'
open(session_path, 'w').write('session-persists')
session_write_succeeded = open(session_path).read() == 'session-persists'

policy_mount_readonly = False
projects_mount_writable = False
for line in open('/proc/self/mountinfo'):
    fields = line.split()
    if len(fields) > 5 and fields[4] == '/home/node/.claude':
        policy_mount_readonly = 'ro' in fields[5].split(',')
    if len(fields) > 5 and fields[4] == '/home/node/.claude/projects':
        projects_mount_writable = 'rw' in fields[5].split(',')

provider = payload['providerEnv']
provider_request = urllib.request.Request(
    provider['ANTHROPIC_BASE_URL'] + '/v1/messages',
    data=b'{"probe":"docker-canary"}',
    headers={
        'content-type': 'application/json',
        'x-api-key': provider['ANTHROPIC_API_KEY'],
    },
    method='POST',
)
with urllib.request.urlopen(provider_request, timeout=10) as response:
    provider_status = response.status
    provider_body = json.loads(response.read())

child_code = """
import glob, json, os, sys
marker = ('MEDCLAW_' + 'RAW_' + 'CANARY_').encode()
hits = []
for proc_path in glob.glob('/proc/[0-9]*'):
    for leaf in ('cmdline', 'environ'):
        candidate = os.path.join(proc_path, leaf)
        try:
            if marker in open(candidate, 'rb').read(): hits.append(candidate)
        except (OSError, PermissionError): pass
print(json.dumps({'raw_hits': hits, 'provider_capability': os.environ.get('ANTHROPIC_API_KEY', '').startswith('medclaw_broker_')}))
"""
child_env = dict(os.environ)
child_env.update(provider)
child_result = json.loads(subprocess.check_output([sys.executable, '-c', child_code], env=child_env))

print(json.dumps({
    'raw_surface_hits': surface_hits,
    'raw_proc_paths': proc_hits,
    'child_raw_proc_paths': child_result['raw_hits'],
    'child_received_only_capability': child_result['provider_capability'],
    'policy_mount_readonly': policy_mount_readonly,
    'policy_write_denied': policy_write_denied,
    'projects_mount_writable': projects_mount_writable,
    'session_write_succeeded': session_write_succeeded,
    'provider_status': provider_status,
    'provider_body': provider_body,
}))
`;

let broker;
try {
  await listen(upstream, '127.0.0.1');
  const upstreamAddress = upstream.address();
  broker = await startProviderCredentialBroker({
    authKind: 'api_key',
    rawCredential: rawCanary,
    upstreamBaseUrl: `http://127.0.0.1:${upstreamAddress.port}`,
  });

  const payload = JSON.stringify({
    providerEnv: broker.containerEnv,
    ...(exposeRawStdinMutant ? { rawCredential: rawCanary } : {}),
  });
  const dockerArgs = [
    'run',
    '--rm',
    '-i',
    '--user',
    '65534:65534',
    '--add-host',
    'host.docker.internal:host-gateway',
    '--mount',
    `type=bind,src=${policyDir},dst=/home/node/.claude,readonly`,
    '--mount',
    `type=bind,src=${projectsDir},dst=/home/node/.claude/projects`,
    '--entrypoint',
    'python3',
    'python:3.12-slim',
    '-c',
    pythonProbe,
  ];

  if (
    JSON.stringify(dockerArgs).includes(rawCanary) ||
    payload.includes(rawCanary)
  ) {
    throw new Error('raw canary reached Docker argv or stdin');
  }

  const result = await runDocker(dockerArgs, payload);
  if (result.code !== 0) {
    throw new Error(`Docker probe failed (${result.code}): ${result.stderr}`);
  }
  const probe = JSON.parse(result.stdout.trim());
  const expected = {
    child_received_only_capability: true,
    policy_mount_readonly: true,
    policy_write_denied: true,
    projects_mount_writable: true,
    session_write_succeeded: true,
    provider_status: 200,
  };
  for (const [name, value] of Object.entries(expected)) {
    if (probe[name] !== value) {
      throw new Error(`Canary assertion failed: ${name}`);
    }
  }
  if (
    Object.values(probe.raw_surface_hits).some(Boolean) ||
    probe.raw_proc_paths.length > 0 ||
    probe.child_raw_proc_paths.length > 0 ||
    probe.provider_body.synthetic !== true ||
    !upstreamSawRawCredential
  ) {
    throw new Error('Canary observed a leaked credential or broken broker');
  }

  process.stdout.write(
    `${JSON.stringify({ ...probe, upstream_authenticated: true }, null, 2)}\n`,
  );
} finally {
  await broker?.close();
  if (upstream.listening) await close(upstream);
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
