# .cursor — Cursor agent configuration

This folder defines context and rules for AI agents in Cursor.

## Structure

- **rules/** — rules as `.mdc` files (Markdown + YAML frontmatter):
  - **core.mdc** — always applied (general DogApp context).
  - **frontend.mdc** — when working with files in `src/frontend/**/*.{ts,tsx,js,jsx,vue}`.
  - **backend.mdc** — when working with `src/backend/Dog/**/*.cs`.
  - **deploy.mdc** — when working with `deploy/**/*.{yml,yaml,sh,ps1}`.

**AGENTS.md** in the project root is a short summary for agents (structure, common tasks).

## Adding rules

1. Create a new `.mdc` file in `.cursor/rules/`.
2. Add frontmatter at the top:
   - `description` — short description (shown in rule picker).
   - `alwaysApply: true` — rule is always in context; otherwise set `globs` (e.g. `**/*.ts`).

See [Cursor Rules](https://cursor.com/docs/context/rules) for more.
