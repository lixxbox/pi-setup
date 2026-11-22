# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - Unreleased

### Added

- Personal fork of `pi-package-template`: metadata, README, AGENTS.md and license
  adapted to this repo; template demo skill and prompt template removed.
- `/pick` command as a reference implementation of `ctx.ui.custom()` with a
  `SelectList`.
- `themes/setup.json` with the full set of 51 color tokens (based on the
  template theme).
- `pi-ui-extension` as an npm dependency: fullscreen sidebar with SESSIONS, CTX
  and VIEW panels, `/sessions-manager`, `/tool-view` and the directory/branch
  footer. Bumped the `@earendil-works/pi-*` dev dependencies to `^1.6.0` because
  the extension requires Pi >= 1.5.0.

### Removed

- Template demo code: `hello` tool, `/hello` command and the noisy
  `session_start` notification.
- `.agents/skills/pi-init` — the template initialization checklist, superseded
  by the adapted README/AGENTS.md.
