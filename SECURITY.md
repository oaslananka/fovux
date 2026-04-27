# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 2.x     | ✅ Active |
| < 2.0   | ❌ No longer maintained |

## Security Model

Fovux is a **local-first tool**. The fovux-mcp HTTP transport binds exclusively to
`127.0.0.1` (localhost) and is never exposed to a network interface by default.

### Authentication

- The HTTP transport is protected by a 32-byte hex bearer token stored at
  `$FOVUX_HOME/auth.token` with mode `0600`.
- The token is generated on first startup using `secrets.token_hex(32)`.
- Rotate the token at any time:

  ```bash
  fovux-mcp rotate-token
  ```

- After rotation, restart any MCP clients or restart the VS Code extension
  to reload the new token.

### Rate Limiting

The HTTP transport enforces a sliding-window rate limit of **100 POST requests per
60 seconds per client IP**. Since the server binds to localhost only, this limit
applies per local process.

### Reverse-Proxy Warning

Do **not** place fovux-mcp behind a reverse proxy that forwards requests from
untrusted networks. The rate-limiter keys on `request.client.host`; behind a
reverse proxy all clients collapse to the proxy IP and rate limiting becomes
ineffective.

### CORS

The CORS allow-list is restricted to `vscode-webview://` origins and
`*.vscode-cdn.net`. No external origins are permitted.

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Email: **oaslananka@gmail.com**

Include:
1. A description of the vulnerability and its potential impact
2. Reproduction steps (version, OS, configuration)
3. Any relevant logs (redact tokens and paths)

You can expect an acknowledgement within **72 hours** and a status update within
**7 days**.

Patches are released as patch versions (e.g. `2.0.1`) and announced in the
[CHANGELOG](CHANGELOG.md) with a `Security` section.
