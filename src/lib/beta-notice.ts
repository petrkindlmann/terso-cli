const NOTICE = '[beta] Surface B (Omnus-connected) is in beta. Production-ready in v1.1-omnus-connected.';

let printed = false;

export function printBetaNotice(): void {
  if (printed) return;
  printed = true;
  if (process.env.TERSO_SUPPRESS_BETA_NOTICE === '1') return;
  process.stderr.write(`${NOTICE}\n`);
}

export const BETA_LABEL = '[beta v1.1]';
