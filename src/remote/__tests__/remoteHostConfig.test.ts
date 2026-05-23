import { parseRemoteHostConfig, buildSshArgs, RemoteHost } from '../remoteHostConfig';

describe('parseRemoteHostConfig', () => {
  it('parses a valid config with defaults', () => {
    const raw = {
      hosts: [
        { hostname: 'example.com', user: 'deploy' },
      ],
    };
    const config = parseRemoteHostConfig(raw);
    expect(config.hosts).toHaveLength(1);
    const host = config.hosts[0];
    expect(host.hostname).toBe('example.com');
    expect(host.user).toBe('deploy');
    expect(host.port).toBe(22);
    expect(host.id).toBe('host-0');
    expect(host.label).toBe('example.com');
  });

  it('preserves explicit id, label, port and identityFile', () => {
    const raw = {
      hosts: [
        { id: 'prod', label: 'Production', hostname: 'prod.example.com', user: 'root', port: 2222, identityFile: '~/.ssh/prod_key' },
      ],
    };
    const config = parseRemoteHostConfig(raw);
    const host = config.hosts[0];
    expect(host.id).toBe('prod');
    expect(host.label).toBe('Production');
    expect(host.port).toBe(2222);
    expect(host.identityFile).toBe('~/.ssh/prod_key');
  });

  it('throws when hosts array is missing', () => {
    expect(() => parseRemoteHostConfig({})).toThrow('Invalid remote host config');
  });

  it('throws when hostname is missing', () => {
    const raw = { hosts: [{ user: 'deploy' }] };
    expect(() => parseRemoteHostConfig(raw)).toThrow('hostname');
  });

  it('throws when user is missing', () => {
    const raw = { hosts: [{ hostname: 'example.com' }] };
    expect(() => parseRemoteHostConfig(raw)).toThrow('user');
  });
});

describe('buildSshArgs', () => {
  const baseHost: RemoteHost = { id: 'h1', label: 'H1', hostname: 'h1.example.com', user: 'admin', port: 22 };

  it('builds basic ssh args', () => {
    const args = buildSshArgs(baseHost);
    expect(args).toContain('admin@h1.example.com');
    expect(args).toContain('-p');
    expect(args).toContain('22');
  });

  it('includes identity file when provided', () => {
    const host = { ...baseHost, identityFile: '~/.ssh/id_rsa' };
    const args = buildSshArgs(host);
    expect(args).toContain('-i');
    expect(args).toContain('~/.ssh/id_rsa');
  });

  it('omits -i flag when no identityFile', () => {
    const args = buildSshArgs(baseHost);
    expect(args).not.toContain('-i');
  });
});
