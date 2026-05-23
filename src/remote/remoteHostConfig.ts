export interface RemoteHost {
  id: string;
  label: string;
  hostname: string;
  user: string;
  port?: number;
  identityFile?: string;
}

export interface RemoteHostConfig {
  hosts: RemoteHost[];
}

const DEFAULT_PORT = 22;

export function parseRemoteHostConfig(raw: unknown): RemoteHostConfig {
  if (typeof raw !== 'object' || raw === null || !Array.isArray((raw as any).hosts)) {
    throw new Error('Invalid remote host config: expected { hosts: [...] }');
  }

  const hosts: RemoteHost[] = (raw as any).hosts.map((h: any, idx: number) => {
    if (!h.hostname || typeof h.hostname !== 'string') {
      throw new Error(`Host at index ${idx} missing required field: hostname`);
    }
    if (!h.user || typeof h.user !== 'string') {
      throw new Error(`Host at index ${idx} missing required field: user`);
    }
    return {
      id: h.id ?? `host-${idx}`,
      label: h.label ?? h.hostname,
      hostname: h.hostname,
      user: h.user,
      port: typeof h.port === 'number' ? h.port : DEFAULT_PORT,
      identityFile: h.identityFile ?? undefined,
    };
  });

  return { hosts };
}

export function buildSshArgs(host: RemoteHost): string[] {
  const args: string[] = [];
  if (host.identityFile) {
    args.push('-i', host.identityFile);
  }
  args.push('-p', String(host.port ?? DEFAULT_PORT));
  args.push(`${host.user}@${host.hostname}`);
  return args;
}
