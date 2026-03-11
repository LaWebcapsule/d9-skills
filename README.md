# d9 Agent Skills

Agent Skills for [d9](https://github.com/LaWebcapsule/directus9) (Directus 9 fork by La Webcapsule). These skills help AI agents working on d9 projects avoid common pitfalls, silent failures, and platform-specific traps discovered during real debugging sessions.

Skills follow the [Agent Skills Open Standard](https://agentskills.io/) and work with Claude Code, Cursor, Copilot, Codex, and [30+ other agents](https://agentskills.io/).

## Installation

### As a Claude Code plugin (recommended)

```bash
# Clone the repo alongside your project
git clone https://github.com/LaWebcapsule/d9-skills.git

# Start Claude Code with the plugin
claude --plugin-dir ./d9-skills
```

This gives you:
- All operational skills (loaded automatically)
- The `/d9-skills:skillops` command to contribute back
- Session briefing on startup
- Pattern detection reminders

### Skills only (any agent)

```bash
npx skills add LaWebcapsule/d9-skills
```

## Available Skills

| Skill | Description |
|-------|-------------|
| [rebuild-plugins-before-deploy](skills/rebuild-plugins-before-deploy/) | Always rebuild plugins before deploy (silent failure trap) |
| [preserve-directus-code-identifiers](skills/preserve-directus-code-identifiers/) | Never rename `@directus/`, `directus_*`, `DIRECTUS_*` in code |
| [pnpm-ci-true-docker](skills/pnpm-ci-true-docker/) | Set `ENV CI=true` for pnpm 10+ in Docker |
| [pnpm-deploy-require-path](skills/pnpm-deploy-require-path/) | Fix `Cannot find module` in `pnpm deploy` containers |
| [crlf-docker-entrypoint](skills/crlf-docker-entrypoint/) | Fix CRLF line endings breaking Docker entrypoints |
| [d9-fork-setup](skills/d9-fork-setup/) | Complete dev environment setup guide |
| [d9-key-secret-env](skills/d9-key-secret-env/) | Ensure KEY and SECRET env vars are set and distinct |
| [d9-migration-session-tracking](skills/d9-migration-session-tracking/) | Fix silent migration failure with session_id columns |
| [cdn-to-local-assets-migration](skills/cdn-to-local-assets-migration/) | Migrate docs assets from CDN to local files |
| [ses-eu-west3-setup](skills/ses-eu-west3-setup/) | AWS SES must use eu-west-3 for EU projects |
| [node-v24-windows-escape](skills/node-v24-windows-escape/) | Escape `!` in `node -e` on Node.js v24 + Windows |
| [vitepress-logo-sizing](skills/vitepress-logo-sizing/) | Fix logo distortion in VitePress dark mode |

## SkillOps Pipeline

The plugin also includes the full SkillOps pipeline for contributing skills back:

| Pipeline Skill | Purpose |
|----------------|---------|
| detect-xp | Detect reusable patterns from debugging sessions |
| match-existing | Compare against existing skills (new / amendment / duplicate) |
| anonymize-session | Strip PII and decontextualize before sharing |
| format-skill | Generate SKILL.md in Agent Skills standard format |
| refine-skill-design | Audit and improve skill quality (ASQM >= 17) |
| submit-skill | Clone repo, create branch, push + PR |
| curate-skills | Score, tag, and audit skills (runs in CI) |
| discover-skills | Search external catalogs for existing skills |

## Contributing

Every debugging session on d9 is a potential skill. Use the `/d9-skills:skillops` command (or `/skillops` from the main d9 repo) to contribute:

```
/d9-skills:skillops
```

The pipeline detects the pattern, anonymizes your session, formats a standard SKILL.md, and opens a PR on this repo automatically.

## Plugin Structure

```
d9-skills/
  .claude-plugin/
    plugin.json           # Plugin manifest
  commands/
    skillops.md           # /d9-skills:skillops command
  hooks/
    hooks.json            # SessionStart briefing + detect-xp reminder
    session-briefing.sh
    detect-xp-reminder.sh
  skills/
    <name>/SKILL.md       # 12 operational skills
    skillops/
      <name>/SKILL.md     # 8 pipeline skills
  scripts/
    verify-skill-structure.mjs
    generate-skill-pr-comment.js
  .github/
    workflows/
      curate-on-pr.yml    # CI: validates skills on PR
```

## Skill Format

Each skill follows the [Agent Skills specification](https://agentskills.io/specification):

```yaml
---
name: skill-name
description: What this skill does and when to use it.
license: MIT
metadata:
  version: "1.0.0"
  tags: [docker, pnpm]
  session_tokens: 5000
  author: anonymous-contributor
---
```

The `session_tokens` field tracks how many tokens the original debugging session consumed. Each time another developer avoids that debugging session thanks to the skill, the community saves approximately that many tokens.

## License

MIT
