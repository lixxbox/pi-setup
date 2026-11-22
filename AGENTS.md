# pi-setup — Agent Context

## Project Overview

This is **my personal [pi](https://pi.dev) setup package** — a private, versioned
bundle of the extensions and theme I use with pi. It is derived from
`pi-package-template` but is **not published to npm** (`"private": true`); it is
installed from the local checkout or from GitHub.

There is **no upstream user base**: breaking changes, renames and dropping
resources are fine. Prefer keeping things minimal over keeping them
API-compatible.

**Tech Stack:** TypeScript (no build step — pi loads `.ts` directly via jiti), typebox for schemas, biome for lint/format.

### Structure

```
extensions/index.ts   # Extension entry point (tools, commands, events)
themes/setup.json     # Theme with all 51 color tokens
node_modules/          # dependencies: pi-stuff, agent-stuff, mattpocock-skills, pi-ui-extension
package.json          # Pi manifest, peer deps, dev scripts (private package)
biome.json            # Linter/formatter config
tsconfig.json         # Type checking only (noEmit)
.agents/skills/       # Agent skills for developing this package
```

Third-party extensions and skills are **not vendored**. They come from three git
dependencies (branch `master`, commits pinned in `package-lock.json`) and one npm
package (range in `package.json`, resolved version pinned in the lockfile):

| Dependency | What is loaded from it |
| --- | --- |
| `pi-stuff` (`github:meteyou/pi-stuff`, installed as `metes-pi-stuff`) | the `prd-loop-pro` and `todos` extensions |
| `agent-stuff` (`github:mitsuhiko/agent-stuff`) | the `web-browser` and `github` skills |
| `mattpocock-skills` (`github:mattpocock/skills`) | the `handoff` skill |
| `pi-ui-extension` (`npm:pi-ui-extension`) | the fullscreen sidebar extension: SESSIONS, CTX, VIEW, footer |

Each is referenced through its `node_modules` path in the `pi` manifest, which
acts as a filter: the other resources those repos ship stay unloaded.

`pi-ui-extension` only renders in **fullscreen TUI mode** (`--tui-mode
fullscreen`, the default) on a wide terminal, and keeps its own state under
`<agent dir>/pi-ui-extension/` (sidebar width, pinned sessions, tool view mode).

Skills land in `skills/<name>/SKILL.md` and prompt templates in
`prompts/<name>.md`. **When adding either, register the directory in the `pi`
manifest in `package.json` and in `files`** — neither is registered right now
(the template samples were removed, and there is no local `skills/` directory).

### Key Constraints

- **No build step** — pi loads `.ts` via jiti. Never add a build/compile step.
- **Peer dependencies** — `@earendil-works/pi-ai`, `@earendil-works/pi-coding-agent`, `@earendil-works/pi-tui`, `@earendil-works/pi-agent-core`, `typebox` are provided by pi at runtime. List them as `peerDependencies` with `"*"` range. Do not bundle them.
- **2-space indentation** — Enforced by biome.
- **Themes require all 51 color tokens** — See `themes/setup.json` for the full list.

---

## Git Conventions

- **Conventional commits** — `feat:`, `fix:`, `docs:`, `chore:`, `ci:`, `refactor:` prefixes, so the history stays readable.
- **No release automation** — this is a private package: no `npm publish`, no release-please. Bump `version` in `package.json` and add a `CHANGELOG.md` entry by hand when a change is worth marking.
- **Commits go straight to `main`** — no PR workflow required for a single-maintainer private repo.

---

## Development Commands

```bash
npm run typecheck      # TypeScript type checking (tsc --noEmit)
npm run lint           # Check lint + formatting (biome check)
npm run lint:fix       # Auto-fix lint + formatting issues (biome check --write)
npm run format         # Format code only (biome format --write)
```

### Testing the Package with pi

There are three ways to test, depending on what you need:

#### 1. Print mode (`-p`) — quick functionality test

Non-interactive, prints text output and exits. Best for verifying that the
extension loads and that tools work.

```bash
# Smoke test: does the extension load without errors? (use -ne to skip other installed extensions)
pi -ne -e . --no-session -p "List the tools you have available."

# Once the package has tools, call one explicitly
pi -ne -e . --no-session -p "Call the <tool_name> tool with <args>. You MUST use the <tool_name> tool."
```

Print mode cannot exercise slash commands or extension UI — use interactive mode
for `/pick`.

**Important:** Always use `-ne` (no-extensions) with `-e .` to avoid interference from globally installed extensions (like pi-mcp-adapter). Only the package being tested will load.

#### 2. Interactive mode — test slash commands and TUI

Full interactive session. Use this to test `/commands`, keyboard shortcuts, and extension UI (select, confirm, input dialogs).

```bash
# Start interactive session with only this package loaded
pi -ne -e . --no-session
# Then type commands like: /pick
```

#### 2b. Automated TUI testing with pilotty

For automated verification of TUI components (SelectList, overlays, custom editors, etc.), use the `pi-test` skill. It guides you through testing with [pilotty](https://github.com/msmps/pilotty) — a PTY-based terminal automation tool that spawns pi, captures screen snapshots, and sends keyboard input programmatically.

**Prerequisites:** `npm install -g pilotty` (macOS/Linux only)

```bash
# Quick test: spawn pi, trigger /pick, verify TUI renders
pilotty spawn --name tui-test --cwd . -- pi -ne -e . --no-session
pilotty wait-for -s tui-test "[Skills]" -t 10000
pilotty type -s tui-test "/pick"
pilotty key -s tui-test Enter
pilotty snapshot -s tui-test --format text
```

See `.agents/skills/pi-test/` for the full skill, and `.agents/skills/pi-test/references/TEST_PATTERNS.md` for ready-to-use test scripts covering SelectList, overlay, settings, editor, widget, and BorderedLoader patterns.

#### 3. RPC mode — programmatic testing from another pi session

Spawns a child pi process you can control via stdin/stdout JSON protocol. Best for automated testing and closing the agentic loop — the parent agent can send prompts, read tool results, and verify behavior.

```javascript
// Spawn a child pi instance for testing
const { spawn } = require("child_process");
const agent = spawn("pi", ["-ne", "-e", ".", "--no-session", "--mode", "rpc"], {
  stdio: ["pipe", "pipe", "pipe"],
  cwd: "/path/to/package",
});

// Read events from stdout (JSONL)
agent.stdout.on("data", (chunk) => {
  for (const line of chunk.toString().split("\n")) {
    if (!line.trim()) continue;
    const evt = JSON.parse(line);
    if (evt.type === "tool_execution_end") {
      console.log("Tool result:", evt.result?.content?.[0]?.text);
    }
    if (evt.type === "agent_end") {
      console.log("Agent finished");
      agent.kill();
    }
  }
});

// Send a prompt after startup
setTimeout(() => {
  agent.stdin.write(JSON.stringify({
    type: "prompt",
    message: "List the tools you have available.",
  }) + "\n");
}, 3000);
```

**Extension UI in RPC mode:** If your extension uses `ctx.ui.select()`, `ctx.ui.confirm()`, or `ctx.ui.input()`, RPC mode sends `extension_ui_request` events on stdout. You must respond with `extension_ui_response` on stdin:

```javascript
// Handling a confirm dialog from the extension
if (evt.type === "extension_ui_request" && evt.method === "confirm") {
  agent.stdin.write(JSON.stringify({
    type: "extension_ui_response",
    id: evt.id,          // must match the request id
    confirmed: true,     // or false, or { cancelled: true }
  }) + "\n");
}
```

#### Verify npm tarball contents

```bash
npm pack --dry-run
```

---

## Agentic Development Loop

Follow this iterative loop when developing the package:

### Step 1: Understand the Requirement

Clarify what the user needs:
- A new tool? command? event handler? skill? prompt template? theme?
- What should it do?
- Are there runtime dependencies (npm packages)?

Read the relevant pi docs before implementing:
- Extensions: `$(npm root -g)/@earendil-works/pi-coding-agent/docs/extensions.md`
- Skills: `$(npm root -g)/@earendil-works/pi-coding-agent/docs/skills.md`
- Themes: `$(npm root -g)/@earendil-works/pi-coding-agent/docs/themes.md`
- Packages: `$(npm root -g)/@earendil-works/pi-coding-agent/docs/packages.md`

If pi is installed under `~/.pi/agent/install/`, the same docs live at
`~/.pi/agent/install/releases/<version>/node_modules/@earendil-works/pi-coding-agent/docs/`.
Resolve `npm root -g` first and check the directory exists before quoting paths.

### Step 2: Implement

Write the code. Key patterns:

**Extension** (`extensions/`):
```typescript
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

export default function (pi: ExtensionAPI) {
  pi.registerTool({ ... });
  pi.registerCommand("name", { ... });
  pi.on("event_name", async (event, ctx) => { ... });
}
```

**Skill** (`skills/name/SKILL.md`):
```markdown
# Skill Name
Use this skill when the user asks about X.
## Steps
1. Do this
2. Then that
```

**Prompt template** (`prompts/name.md`):
```markdown
---
description: What this template does
---
Template content here.
```

**Theme** (`themes/name.json`): Must include all 51 color tokens. Copy `themes/setup.json` as a starting point.

### Step 3: Verify

Run all checks after making changes:

```bash
npm run typecheck && npm run lint
```

If either fails, fix the issues before proceeding. Common fixes:
- Type errors: add missing types, fix imports
- Lint errors: run `npm run lint:fix`

### Step 4: Test with pi

Choose the right testing mode for what you're verifying:

**For tools and basic functionality** (quick, automated):
```bash
pi -ne -e . --no-session -p "Call <tool_name> with <args>. You MUST use the <tool_name> tool."
```
Check the output for correct results.

**For slash commands, keyboard shortcuts, and UI dialogs** (interactive):
```bash
pi -ne -e . --no-session
# Then type: /<command_name>
```

**For TUI components** (automated with pilotty):
Use the `pi-test` skill — it provides step-by-step guidance and ready-to-use test scripts for interactive TUI verification.

**For programmatic end-to-end testing** (RPC mode):
Spawn a child `pi --mode rpc` process and verify tool results via the JSONL event stream. See the "Testing the Package with pi" section above for the full pattern.

**After any test**, verify:
- Extension loads without errors
- Tools return correct results
- Commands respond as expected
- No unexpected notifications or errors

### Step 5: Commit

Use conventional commit format:
```
feat: add new tool for X
fix: handle edge case in Y
docs: update README with Z
chore: update dependencies
ci: update workflow
refactor: simplify X
```

### Step 6: Iterate

Repeat steps 1-5 for each feature or fix. Keep commits small and focused.

---

## Sync / Update Flow

This package is not published. To pick up changes on another machine:

1. Commit and push to `main` (CI runs typecheck + lint).
2. On the other machine: `pi update git:github.com/lixxbox/pi-setup`
   (or `git pull` + `/reload` if it was installed from a local path).

No version bump or release is required for updates to propagate.

---

## Common Pitfalls

- **Forgetting `typebox` schemas** — Tool parameters must use `Type.Object()` from `typebox`, not raw TypeScript types
- **Importing from wrong package** — Use `import type { ExtensionAPI } from "@earendil-works/pi-coding-agent"` (type import)
- **Missing `export default function`** — Extensions must export a default factory function
- **Adding runtime deps as devDependencies** — Runtime npm packages go in `dependencies`, not `devDependencies`
- **Forgetting `npm install` after changing dependencies** — local installs are not installed by pi; without `node_modules/` the extension and skill paths in the `pi` manifest fail to load and pi aborts with a load error
- **Dropping the `.npmrc`** — npm 12 defaults `allow-git` to `none`, so without `allow-git=root` in `.npmrc` every install (`pi install git:...` included) dies with `EALLOWGIT` on the `github:` dependencies
- **Incomplete themes** — Pi requires all 51 color tokens; partial themes cause errors
- **Pinning peer deps** — Peer dependencies must use `"*"` range, not `"^0.70.0"` etc.
