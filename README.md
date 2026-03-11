# d9 Agent Skills

> A Claude Code plugin and Agent Skills repo for [d9](https://github.com/LaWebcapsule/directus9) (Directus 9 fork by La Webcapsule).

12 operational skills from real debugging sessions + a full contribution pipeline (SkillOps) to turn any future debugging session into a reusable skill, automatically.

Skills follow the [Agent Skills Open Standard](https://agentskills.io/) and work with Claude Code, Cursor, Copilot, Codex, and [30+ other agents](https://agentskills.io/).

---

## What is this?

When developers work on d9, they encounter subtle bugs: silent failures, platform traps, missing env vars, Docker gotchas. Each bug costs time and AI tokens to debug.

**d9-skills captures these debugging sessions as reusable skills** so that no one encounters the same bug twice. An AI agent reading these skills will know the fix before hitting the error.

The plugin also includes the **SkillOps pipeline**: a one-command flow (`/d9-skills:skillops`) that detects patterns from your current session, anonymizes them, formats a standard skill file, and opens a PR on this repo. Zero manual work.

### Token economy

Every skill includes a `session_tokens` field: how many tokens the original debugging session consumed. Each time another developer (or AI agent) avoids that session thanks to a skill, the community saves approximately that many tokens. Skills are a form of collective intelligence.

---

## Installation

### Option 1: Claude Code plugin (recommended)

This is the full experience: skills + `/d9-skills:skillops` command + hooks (session briefing, pattern detection).

```bash
# 1. Clone the plugin alongside your project
cd ~/Code/my-project
git clone https://github.com/LaWebcapsule/d9-skills.git

# 2. Launch Claude Code with the plugin
claude --plugin-dir ./d9-skills
```

That's it. On startup, Claude gets a briefing of all 12 skills and the SkillOps pipeline. The `/d9-skills:skillops` command is available immediately.

**What you get:**

| Feature | Description |
|---------|-------------|
| 12 operational skills | Loaded into Claude's context automatically |
| 8 pipeline skills | Power the SkillOps contribution flow |
| `/d9-skills:skillops` | One command to contribute a skill |
| Session briefing hook | Compact summary of all skills on startup |
| Pattern detection hook | Reminder after each error resolution |

> **Tip**: You can also use an absolute path: `claude --plugin-dir /path/to/d9-skills`

#### Troubleshooting plugin hooks

If the session briefing doesn't appear on startup:

```bash
# Check that hook scripts are executable
chmod +x d9-skills/hooks/session-briefing.sh d9-skills/hooks/detect-xp-reminder.sh

# Test the briefing script manually
CLAUDE_PLUGIN_ROOT=./d9-skills bash ./d9-skills/hooks/session-briefing.sh

# Run Claude Code with debug to see hook loading
claude --debug --plugin-dir ./d9-skills
```

Claude Code may also prompt you to approve plugin hooks the first time. Accept the hook permissions when prompted.

### Option 2: Skills only (any AI agent)

If you use Cursor, Copilot, Codex, or another agent, install just the skill files:

```bash
npx skills add LaWebcapsule/d9-skills
```

This copies the 12 operational SKILL.md files into your agent's skill directory. No plugin features (hooks, commands, pipeline).

### Option 3: Read-only (no install)

You can also browse the skills directly on GitHub. Each skill is a standalone Markdown file in [`skills/`](./skills/).

---

## Available Skills

### Operational skills (12)

Skills from real debugging sessions. Claude reads these automatically and applies them when relevant.

| Skill | What it prevents |
|-------|-----------------|
| [rebuild-plugins-before-deploy](skills/rebuild-plugins-before-deploy/) | Silent extension failures in production |
| [preserve-directus-code-identifiers](skills/preserve-directus-code-identifiers/) | Breaking Directus internals during rebrand |
| [pnpm-ci-true-docker](skills/pnpm-ci-true-docker/) | pnpm 10+ TTY prompt hanging Docker builds |
| [pnpm-deploy-require-path](skills/pnpm-deploy-require-path/) | `Cannot find module` in pnpm deploy containers |
| [crlf-docker-entrypoint](skills/crlf-docker-entrypoint/) | Windows CRLF breaking Docker entrypoints |
| [d9-fork-setup](skills/d9-fork-setup/) | 2-day onboarding reduced to 2 hours |
| [d9-key-secret-env](skills/d9-key-secret-env/) | Auth failures from missing KEY/SECRET env vars |
| [d9-migration-session-tracking](skills/d9-migration-session-tracking/) | Silent migration failure + 500 on login |
| [cdn-to-local-assets-migration](skills/cdn-to-local-assets-migration/) | Broken links from CDN asset removal |
| [ses-eu-west3-setup](skills/ses-eu-west3-setup/) | Email delivery failure with wrong AWS region |
| [node-v24-windows-escape](skills/node-v24-windows-escape/) | Silent bash history expansion on Windows |
| [vitepress-logo-sizing](skills/vitepress-logo-sizing/) | Logo distortion in VitePress dark mode |

### SkillOps pipeline skills (8)

Power the contribution flow. Not loaded by default — invoked by `/d9-skills:skillops`.

| Pipeline step | What it does |
|---------------|-------------|
| detect-xp | Detect reusable patterns from the current session |
| match-existing | Compare against existing skills (new / amendment / duplicate) |
| anonymize-session | Strip PII, secrets, project-specific details |
| format-skill | Generate a SKILL.md in Agent Skills standard format |
| refine-skill-design | Audit and improve quality (ASQM >= 17 target) |
| submit-skill | Clone this repo to temp, create branch, push + open PR |
| curate-skills | Score and validate skills (runs in CI on PRs) |
| discover-skills | Search external catalogs before creating new skills |

---

## Contributing a skill

### The easy way: `/d9-skills:skillops`

After any debugging session where you solved a non-trivial problem:

```
/d9-skills:skillops
```

The pipeline guides you through 6 steps:

1. **Detect** — Identifies the pattern from your session
2. **Match** — Checks if it already exists (avoids duplicates)
3. **Anonymize** — Strips PII, secrets, project names
4. **Format** — Generates a SKILL.md in standard format
5. **Quality** — Validates structure and scores >= 17/20
6. **Submit** — Clones this repo, creates a branch, opens a PR

Every step requires your confirmation. Nothing leaves your machine until step 6. Your working repo is never modified.

### The manual way

1. Create `skills/<your-skill-name>/SKILL.md`
2. Follow the [skill format](#skill-format) below
3. Run validation: `node scripts/verify-skill-structure.mjs skills/<your-skill-name>`
4. Open a PR

---

## Skill Format

Each skill follows the [Agent Skills Open Standard](https://agentskills.io/specification):

```yaml
---
name: skill-name                    # Required. Kebab-case, matches directory name.
description: What + when, max 1024. # Required. One-line summary.
license: MIT                        # Optional.
metadata:                           # Optional.
  version: "1.0.0"
  tags: [docker, pnpm, node]
  session_tokens: 5000              # Tokens consumed in the original debug session
  author: anonymous-contributor
  source: session-contribution
---

# Human-Readable Title

## Purpose
What problem this prevents.

## Triggers
When this skill should activate (specific conditions).

## Behavior
Step-by-step actions.

## Errors Prevented
Real error messages this avoids.

## Restrictions
### Hard Boundaries (NEVER / MUST / ALWAYS)
### Soft Boundaries (prefer / by default)

## Self-Check
- [ ] Verification items

## Examples
### Example 1: Happy path
### Example 2 (Edge Case): ...
```

Only `name` and `description` are required. Everything else is recommended for quality.

---

## Plugin Structure

```
d9-skills/
  .claude-plugin/
    plugin.json               # Plugin manifest (name, version, description)
  commands/
    skillops.md               # /d9-skills:skillops slash command
  hooks/
    hooks.json                # SessionStart briefing + Stop detect-xp reminder
    session-briefing.sh       # Generates compact skills summary
    detect-xp-reminder.sh     # Nudges pattern detection after errors
  skills/
    <name>/SKILL.md           # 12 operational skills
    skillops/
      <name>/SKILL.md         # 8 pipeline skills
  scripts/
    verify-skill-structure.mjs  # Structural validation (score /20)
    generate-skill-pr-comment.js # CI PR review comment
  .github/
    workflows/
      curate-on-pr.yml        # CI: validates skills + posts review on PRs
  AGENTS.md                   # Agent guidance (CLAUDE.md is a symlink)
  CLAUDE.md -> AGENTS.md      # Claude Code reads this automatically
```

---

## Validation

```bash
# Validate a single skill
node scripts/verify-skill-structure.mjs skills/<name>

# Validate all 20 skills
node scripts/verify-skill-structure.mjs --all
```

---

## FAQ

**Q: Do I need to clone d9 to use the skills?**
A: No. This is a standalone repo. Clone it alongside any project and use `--plugin-dir`.

**Q: Does the plugin modify my project repo?**
A: Never. The SkillOps pipeline clones d9-skills to a temp directory for PRs. Your project is untouched.

**Q: Can I use this without Claude Code?**
A: Yes. Use `npx skills add LaWebcapsule/d9-skills` for any agent, or just read the SKILL.md files directly.

**Q: How do I update the skills?**
A: `cd d9-skills && git pull`. Then `/reload-plugins` in Claude Code.

**Q: What's `session_tokens`?**
A: The number of tokens consumed during the original debugging session. It quantifies how much the community saves each time the skill prevents someone from repeating that session.

---

## License

MIT
