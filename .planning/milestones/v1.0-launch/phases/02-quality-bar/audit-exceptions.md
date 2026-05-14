# `npm audit` exceptions

CI gates on `npm audit --audit-level=high --omit=dev`. Production exceptions are tracked here.

| Date | CVE / advisory | Package | Severity | Reason | Replacement plan |
|---|---|---|---|---|---|

No exceptions currently — production tree audits clean as of the Phase 02 landing.

If a high-severity finding appears with no upstream patch:
1. Add a row above with the advisory ID, severity, and reason for accepting risk.
2. Open a tracking issue.
3. Re-evaluate weekly via the Dependabot PR cycle.
4. Treat any new exception as a release blocker unless explicitly accepted.
