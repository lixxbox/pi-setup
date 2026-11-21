# pi-setup

Personal [pi](https://pi.dev) setup as a pi package: my own extensions and a
theme, versioned in git so they stay in sync across machines.

Private, not published to npm.

## Contents

Declared in the `pi` manifest in `package.json`:

| Resource | Path | Name | What it does |
| --- | --- | --- | --- |
| Extension | `extensions/index.ts` | — | Registers the commands below |
| Command | `extensions/index.ts` | `/pick` | Interactive selection dialog (`SelectList` TUI) |
| Theme | `themes/setup.json` | `setup` | Custom color theme, all 51 tokens |

Repo-level tooling (not loaded by pi):

| Path | Purpose |
| --- | --- |
| `AGENTS.md` | Project context and development workflow for coding agents |
| `.agents/skills/pi-package/` | Patterns for building pi packages |
| `.agents/skills/pi-test/` | TUI testing with [pilotty](https://github.com/msmps/pilotty) |
| `biome.json`, `tsconfig.json` | Lint/format and type-check config |
| `.github/workflows/ci.yml` | Typecheck + lint on push |

The extension is currently a placeholder: `/pick` is kept as a working
reference for `ctx.ui.custom()` + `SelectList`.

## Install

### From the local checkout

```bash
pi install /path/to/pi-setup
```

Use the absolute path — a relative path in the settings file is resolved
relative to that file, so it breaks when the checkout moves. Local installs are
loaded in place without copying, so edits are picked up with `/reload`.

Add `-l` (`--local`) to write the declaration to `.pi/settings.json` of the
current project instead of `~/.pi/agent/settings.json`.

### From GitHub

```bash
pi install git:github.com/lixxbox/pi-setup
```

Pi clones the repo and reconciles it to the configured ref (default branch
unless you append `@<tag-or-commit>`, e.g.
`git:github.com/lixxbox/pi-setup@v0.1.0`).

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
