#!/usr/bin/env bash
# omnus-session-observer.sh
#
# Claude Code hook script that fires on SessionEnd.
# Reads hook event JSON from stdin, extracts transcript path and session info,
# then spawns the Node.js processor in the background so we never block
# session exit.
#
# Required environment:
#   OMNUS_API_KEY  — API key for the Omnus ingestion endpoint
#   OMNUS_API_URL  — (optional) Base URL, defaults to https://omnus.dev

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROCESSOR="${SCRIPT_DIR}/dist/process-session.js"

# Read hook event from stdin
EVENT="$(cat)"

# Extract fields using Node.js (always available, no python3 dependency)
TRANSCRIPT_PATH="$(echo "$EVENT" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).transcript_path||'')}catch{console.log('')}})" 2>/dev/null || echo "")"
CWD="$(echo "$EVENT" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).cwd||'')}catch{console.log('')}})" 2>/dev/null || echo "")"
SESSION_ID="$(echo "$EVENT" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).session_id||'')}catch{console.log('')}})" 2>/dev/null || echo "")"

# Validate required fields
if [ -z "$TRANSCRIPT_PATH" ] || [ -z "$CWD" ] || [ -z "$SESSION_ID" ]; then
  echo "[omnus-observer] Missing required fields in hook event, skipping." >&2
  exit 0
fi

# Verify the processor script exists
if [ ! -f "$PROCESSOR" ]; then
  echo "[omnus-observer] Processor not found at: $PROCESSOR" >&2
  echo "[omnus-observer] Run: cd ${SCRIPT_DIR} && npx tsc -p tsconfig.json" >&2
  exit 0
fi

# Run the processor in the background so we don't block session exit.
# Detach from the shell: redirect stdout/stderr to a log file and disown.
LOG_DIR="${HOME}/.omnus/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="${LOG_DIR}/session-observer.log"

node "$PROCESSOR" "$TRANSCRIPT_PATH" "$CWD" "$SESSION_ID" \
  >> "$LOG_FILE" 2>&1 &
disown

exit 0
