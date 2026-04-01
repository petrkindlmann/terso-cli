import * as fs from 'node:fs';
import * as path from 'node:path';

const TERSO_DIR = '.terso';
const LOCAL_DIR = 'local';
const CAPTURES_FILE = 'captures.jsonl';

interface OfflineCapture {
  text: string;
  projectHint?: string;
  scopeHint?: string;
  capturedAt: string;
}

function getCapturesPath(): string {
  return path.join(process.cwd(), TERSO_DIR, LOCAL_DIR, CAPTURES_FILE);
}

export function appendOfflineCapture(capture: OfflineCapture): void {
  const filePath = getCapturesPath();
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(filePath, JSON.stringify(capture) + '\n');
}

export function readOfflineCaptures(): OfflineCapture[] {
  const filePath = getCapturesPath();
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, 'utf-8').trim();
  if (!content) return [];

  return content.split('\n').map((line) => JSON.parse(line) as OfflineCapture);
}

export function clearOfflineCaptures(): void {
  const filePath = getCapturesPath();
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function pendingCaptureCount(): number {
  return readOfflineCaptures().length;
}
