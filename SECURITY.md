# Security policy

Thank you for taking the time to disclose a vulnerability responsibly.

## Reporting

Email **security@omnus.dev** with:

- A description of the issue.
- Steps to reproduce.
- The version of `terso-cli` you tested against (`terso --version`).
- Whether you'd like to be credited in the release notes.

Please do **not** open a public GitHub issue for security-sensitive reports.

## What to expect

- An acknowledgement within 72 hours.
- A first assessment within 7 days.
- A patched release coordinated with the disclosure, typically within 30 days
  of confirmation. If a fix needs longer, we'll tell you why.

## Scope

The published `terso-cli` npm package, this repository's source, and the
session-observer hook shipped alongside it are all in scope. The Omnus service
is a separate project — report Omnus issues to the same address but mention
that it's an Omnus concern.

## Out of scope

- Vulnerabilities in third-party agent clients (Claude Code, Cursor, Codex,
  etc.). Report those upstream.
- Social engineering of maintainers.
- Volumetric DoS without a corresponding flaw in `terso`.

## Encryption

If you need to encrypt a report, request a PGP key in your first email and we
will reply with a current public key.
