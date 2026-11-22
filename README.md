# pi-setup

Personal [pi](https://pi.dev) setup as a pi package: my own extensions and a
theme, versioned in git so they stay in sync across machines.

Private, not published to npm.

## Contents

Loaded by pi (declared in the `pi` manifest in `package.json`):

| Title | Purpose | Source |
| --- | --- | --- |
| `/pick` command | Interactive selection dialog (`SelectList` TUI). Placeholder kept as a working reference for `ctx.ui.custom()` | `extensions/index.ts` |
| `setup` theme | Custom color scheme, all 51 tokens required by pi | `themes/setup.json` |
| `/prd-loop-pro`, `/ralph-pro` commands | Autonomous PRD task orchestrator with review-fix pipeline | `node_modules/metes-pi-stuff` (dependency) |
| `todo` tool, `/todos` command | File-based todo manager with claiming, locking and TUI | `node_modules/metes-pi-stuff` (dependency) |
| `web-browser` skill | Drive Chrome/Chromium over CDP: navigate, fill forms, screenshots | `node_modules/agent-stuff` (dependency) |
| `github` skill | `gh` CLI for issues, PRs, CI runs and API queries | `node_modules/agent-stuff` (dependency) |
| `pi-share` skill | Load session transcripts from pi-share URLs | `node_modules/agent-stuff` (dependency) |
| `/handoff` skill | Compact the conversation into a handoff document (`disable-model-invocation`) | `node_modules/mattpocock-skills` (dependency) |
| Fullscreen sidebar, `/sessions-manager`, `/tool-view`, `Ctrl+Shift+O` | SESSIONS (switch/rename/pin/delete sessions, resource shortcuts), CTX (context composition, TTFT/TPS), VIEW (Normal/Focus/Compact/Hidden for tool output and Thinking), tool/MCP counters, directory+branch footer | `node_modules/pi-ui-extension` (dependency) |

Only the paths named in the `pi` manifest load — not the other extensions and
skills that `pi-stuff`, `agent-stuff` and `mattpocock-skills` ship.

`pi-ui-extension` needs fullscreen TUI mode (`--tui-mode fullscreen`, the
default) and a wide terminal; in `regular` mode it stays inactive.

Repo tooling (not loaded by pi):

| Title | Purpose | Source |
| --- | --- | --- |
| Project context | Development loop, test modes, pitfalls for coding agents | `AGENTS.md` |
| `pi-package` skill | Patterns for building extensions, tools, schemas, themes, skills, prompts | `.agents/skills/pi-package/` |
| `pi-test` skill | Automated TUI testing recipes with pilotty | `.agents/skills/pi-test/` |
| Lint and formatting | Biome, 2-space indent, 100-column lines | `biome.json` |
| Type check | `tsc --noEmit` over `extensions/**` | `tsconfig.json` |
| CI | Typecheck and lint on push and pull request | `.github/workflows/ci.yml` |

## Install

### From the local checkout

```bash
pi install /path/to/pi-setup
```

Use the absolute path — a relative path in the settings file is resolved
relative to that file, so it breaks when the checkout moves. Local installs are
loaded in place without copying, and pi does not run `npm install` for them, so
run it once yourself to fetch the dependencies:

```bash
npm install
```

No extra flags needed: the committed `.npmrc` sets `allow-git=root`, because
npm 12 defaults to `allow-git=none` and would otherwise refuse the `github:`
dependencies with `EALLOWGIT`.

Edits are picked up with `/reload`.

Add `-l` (`--local`) to write the declaration to `.pi/settings.json` of the
current project instead of `~/.pi/agent/settings.json`.

### From GitHub

```bash
pi install git:github.com/lixxbox/pi-setup
```

Pi clones the repo, reconciles it to the configured ref (default branch unless
you append `@<tag-or-commit>`, e.g. `git:github.com/lixxbox/pi-setup@v0.1.0`),
and installs the dependencies, so `pi-stuff`, `agent-stuff`,
`mattpocock-skills` and `pi-ui-extension` are fetched automatically. The
`github:` specs are fetched over SSH (`git+ssh://git@github.com/...`), so a
GitHub SSH key must be available; `.npmrc` (`allow-git=root`) is what lets the
install through on npm 12.

### Without installing

Load the package for a single invocation only:

```bash
pi -e /path/to/pi-setup     # or: pi -e git:github.com/lixxbox/pi-setup
```

## Update

| Installed as | Command |
| --- | --- |
| Any package | `pi update --extensions` (all packages) |
| git source | `pi update git:github.com/lixxbox/pi-setup` |
| Local path | `git pull` in the checkout, then `/reload` in pi |
| Git dependencies | `npm update` in the checkout (they follow their `master` branches), then `/reload` |
| `pi-ui-extension` | bump its range in `package.json`, `npm install`, then `/reload` |
| Pi itself + all packages | `pi update --all` |

Additional commands:

| Task | Command |
| --- | --- |
| List installed packages | `pi list` |
| Remove this package | `pi remove <source>` |
| Re-apply after editing resources | `/reload` |

A pinned ref (tag or commit) is never moved by `pi update` — change the
declaration if you want to follow a newer tag.

## Development

```bash
npm install
npm run typecheck   # tsc --noEmit
npm run lint        # biome check
npm run lint:fix    # biome check --write
```

No build step: pi loads the TypeScript sources directly via jiti.

Smoke test the package in isolation (`-ne` suppresses other installed
extensions):

```bash
pi -ne -e . --no-session -p "List the tools you have available."
pi -ne -e . --no-session            # interactive: test /pick
```

### Theme

The theme is shipped but not selected. Activate it via `/settings` or add it to
`~/.pi/agent/settings.json`:

```json
{ "theme": "setup" }
```

## License

MIT
