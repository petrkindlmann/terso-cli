# Omnus Session Observer — Claude Code Hook

Automatically captures decisions and changes from Claude Code sessions into Omnus via the ingestion API.

## What it does

When a Claude Code session ends, this hook:

1. Reads the session transcript (JSONL file)
2. Extracts files changed, decisions made, and the final summary
3. Posts a structured summary to the Omnus ingestion API as a `claude_code` source type
4. Runs in the background so it never blocks session exit

Trivial sessions (2 or fewer messages with no tool calls) are skipped.

## Setup

### 1. Build the processor

```bash
cd cli/hooks
npx tsc -p tsconfig.json
```

This compiles `process-session.ts` into `dist/process-session.js`.

### 2. Set environment variables

Add to your shell profile (`~/.zshrc`, `~/.bashrc`, etc.):

```bash
export OMNUS_API_KEY="your-api-key-here"
# Optional: override the default API URL (defaults to https://omnus.dev)
# export OMNUS_API_URL="http://localhost:3000"
```

### 3. Configure the hook

Add the following to `~/.claude/settings.json` (or `.claude/settings.json` in a project):

```json
{
  "hooks": {
    "SessionEnd": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "/Users/petr/projects/omnus/cli/hooks/omnus-session-observer.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

Update the `command` path to match your local checkout location.

An example config is provided in `hook-config.json`.

## How it works

### Shell script (`omnus-session-observer.sh`)

- Receives hook event JSON on stdin from Claude Code
- Extracts `transcript_path`, `cwd`, and `session_id` using python3
- Spawns the Node.js processor in the background (detached)
- Logs output to `~/.omnus/logs/session-observer.log`
- Always exits with code 0 to never block the session

### Transcript processor (`process-session.ts`)

- Reads the JSONL transcript file
- Extracts files changed from `Write`, `Edit`, and `Bash` tool calls
- Detects decisions from assistant messages (looks for "decided", "chose", "rationale", etc.)
- Detects the project name from `package.json`, `.terso/project.json`, or the directory name
- Posts to `POST /api/ingestions` with source type `claude_code`
- Uses the session ID as an idempotency key to prevent duplicate ingestions

### Hook event format

Claude Code sends JSON on stdin:

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/Users/.../project",
  "hook_event_name": "SessionEnd",
  "reason": "other"
}
```

### Ingestion payload

```json
{
  "sourceType": "claude_code",
  "text": "Claude Code session abc123\nProject: my-project\n...",
  "projectHint": "my-project",
  "scopeHint": "project",
  "idempotencyKey": "claude_code_session_abc123"
}
```

## Debugging

Check the log file:

```bash
cat ~/.omnus/logs/session-observer.log
```

Test manually with a mock event:

```bash
echo '{"transcript_path":"/path/to/transcript.jsonl","cwd":"/Users/petr/projects/my-project","session_id":"test-123"}' | ./omnus-session-observer.sh
```

## Timeout considerations

- The `SessionEnd` hook has a default timeout of 1.5 seconds (configurable via `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS`)
- The shell script spawns the processor in the background and exits immediately, so it completes well within any timeout
- The processor itself has an 8-second HTTP timeout for the API call
- Set the hook timeout to 10 seconds in the config for safety margin

## File structure

```
cli/hooks/
  omnus-session-observer.sh  -- Entry point (shell script, receives stdin)
  process-session.ts         -- Source (TypeScript)
  dist/
    process-session.js       -- Compiled processor (run with node)
    package.json             -- ESM marker
  tsconfig.json              -- TypeScript config for compilation
  hook-config.json           -- Example Claude Code settings snippet
  README.md                  -- This file
```
