# pi-setup

Personal [pi](https://pi.dev) setup: my own extensions and theme, kept in one
repo so they are versioned and easy to sync across machines.

Not published to npm — this is a private package for my own use.

## Contents

```
extensions/index.ts   # Tools, slash commands, event handlers
themes/setup.json     # Custom theme (all 51 color tokens)
AGENTS.md             # Agent context + development workflow
.agents/skills/       # Agent skills for developing this package
```

## Usage

Install it into pi (once):

```bash
pi install ./            # local checkout
pi install git:github.com/lixxbox/pi-setup   # from GitHub
```

Or load it ad hoc for a single invocation:

```bash
pi -e .
```

## What's in the extension

| Resource | Name | Description |
| --- | --- | --- |
| Command | `/pick` | Interactive selection dialog (`SelectList` TUI) |

These are placeholders — replace them with real functionality as needed.

## Development

```bash
npm install
npm run typecheck   # tsc --noEmit
npm run lint        # biome check
npm run lint:fix    # biome check --write
```

No build step: pi loads the TypeScript sources directly via jiti.

Test a change:

```bash
pi -ne -e . --no-session -p "List the tools you have available."   # loads cleanly?
pi -ne -e . --no-session                                            # interactive, for /pick
```

`-ne` (`--no-extensions`) keeps globally installed extensions out of the way, so
only this package loads.

## License

MIT
