# Security Model

Fovux v2.0.0 keeps `stdio` as the default MCP transport and treats the optional HTTP server as a local, authenticated control plane.

## HTTP auth

- `GET /health` is the only unauthenticated endpoint.
- All other HTTP routes require `Authorization: Bearer <token>`.
- The bearer token is stored at `FOVUX_HOME/auth.token`.
- On Unix-like systems the token file is created with restrictive permissions when possible.

## Token lifecycle

Generate or reveal the current token by starting the HTTP server once:

```bash
fovux-mcp serve --http
```

Rotate the token explicitly:

```bash
fovux-mcp rotate-token
```

The VS Code extension reads the token from the same `FOVUX_HOME` directory, so `fovux.home` in Studio and `FOVUX_HOME` for `fovux-mcp` must point at the same location.

## Rate limiting

`POST /tools/*` is rate-limited per client IP to reduce accidental hammering from local scripts or misconfigured clients. Exceeded requests return `429 Too Many Requests` with `Retry-After`.

## Filesystem safety

Fovux validates writable output paths before creating artifacts. By default, writes are constrained to:

- `FOVUX_HOME`
- the current working directory
- any explicitly allowed roots

HTTP mode is stricter than stdio mode and is intended for same-machine Studio workflows.

## Dataset YAML validation

Training inputs are validated before the detached worker starts:

- unsafe YAML loaders are not used
- only known dataset keys are accepted
- normalized dataset paths must resolve under the dataset root

## Supply chain

The Azure release train produces SBOM artifacts and keeps Python and Studio builds on a single CI system. Publishing remains manual-gated by the maintainer.
