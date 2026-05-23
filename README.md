# cronscope

> Terminal dashboard for visualizing and auditing cron jobs across local and remote hosts

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

## Installation

```bash
npm install -g cronscope
```

## Usage

Launch the interactive dashboard against your local cron jobs:

```bash
cronscope
```

Connect to a remote host via SSH:

```bash
cronscope --host user@192.168.1.10 --key ~/.ssh/id_rsa
```

Audit multiple hosts defined in a config file:

```bash
cronscope --config hosts.yml
```

### Config Example (`hosts.yml`)

```yaml
hosts:
  - name: web-server
    address: user@10.0.0.1
    key: ~/.ssh/id_rsa
  - name: db-server
    address: admin@10.0.0.2
    key: ~/.ssh/id_rsa
```

Once running, use arrow keys to navigate jobs, `Enter` to inspect details, `r` to refresh, and `q` to quit.

## Features

- Real-time cron job visualization in your terminal
- SSH support for auditing remote hosts
- Multi-host aggregated view
- Schedule parsing with human-readable descriptions
- Export audit reports to JSON or CSV

## Development

```bash
git clone https://github.com/yourname/cronscope.git
cd cronscope
npm install
npm run dev
```

## License

[MIT](LICENSE)