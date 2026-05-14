# Security

This action does two things in CI:

1. Installs `terso-cli` from npm using whichever version you specify.
2. Runs `terso emit --check` against your repo's working tree.

It never writes to your repo (`terso emit --check` is read-only), never sends
network traffic apart from the npm install, and stores no state between runs.

## Reporting a vulnerability

Email `security@omnus.dev`. Do not open a public issue. See
[the upstream policy](https://github.com/petrkindlmann/terso-cli/blob/main/SECURITY.md)
for response timelines.

## Threat model

The action is a thin wrapper around `terso emit --check`. The primary supply-chain
risk is upstream `terso-cli`. Pin `terso-version` to a known-good semver if your
threat model requires it (`terso-version: '1.0.0'`).
