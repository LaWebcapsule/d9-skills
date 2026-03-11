# AGENTS.md

Guidance for AI coding agents working with this repository.

> **Note:** `CLAUDE.md` is a symlink to this file.

## Repository Structure

This repo is a **Claude Code plugin** (`d9-skills`) and an Agent Skills repository.

```
.claude-plugin/
  plugin.json             # Plugin manifest
commands/
  skillops.md             # /d9-skills:skillops slash command
hooks/
  hooks.json              # SessionStart briefing + detect-xp reminder hooks
  session-briefing.sh
  detect-xp-reminder.sh
skills/
  {skill-name}/
    SKILL.md              # Operational skills (12)
  skillops/
    {skill-name}/
      SKILL.md            # Pipeline skills (8)
scripts/
  verify-skill-structure.mjs
  generate-skill-pr-comment.js
```

## Skills Format

Skills follow the [Agent Skills Open Standard](https://agentskills.io/).

### Frontmatter (Required)

```yaml
---
name: skill-name           # Required. Lowercase, hyphens only. Must match directory name.
description: ...           # Required. Max 1024 chars. What + when.
license: MIT               # Optional.
metadata:                  # Optional. Extra fields.
  version: "1.0.0"
  tags: [tag1, tag2]
  session_tokens: 5000     # Tokens consumed in the debugging session
  author: anonymous-contributor
  source: session-contribution
---
```

### Body

Markdown instructions. Recommended sections:
- **Purpose** — What problem this prevents
- **Triggers** — When the skill should activate
- **Behavior** — Step-by-step actions
- **Errors Prevented** — Real error messages and descriptions
- **Restrictions** — Hard/soft boundaries
- **Self-Check** — Checkbox validation list
- **Examples** — At least 2, including 1 edge case

## Creating a New Skill

1. Create directory: `mkdir -p skills/{skill-name}`
2. Create `SKILL.md` following the format above
3. Ensure `name` in frontmatter matches the directory name
4. Open a PR

Skills are typically contributed via the SkillOps pipeline. Run `/d9-skills:skillops` (or `/skillops` from the main d9 repo) after a debugging session.

## SkillOps Pipeline

The pipeline skills live in `skills/skillops/` and handle the full contribution flow:

1. **detect-xp** — Detect reusable patterns
2. **match-existing** — Compare against existing skills
3. **anonymize-session** — Strip PII and decontextualize
4. **format-skill** — Generate SKILL.md
5. **refine-skill-design** — Quality audit (ASQM >= 17)
6. **submit-skill** — Clone, branch, push, PR
7. **curate-skills** — CI scoring and audit
8. **discover-skills** — Search external catalogs

## Validation

```bash
node scripts/verify-skill-structure.mjs skills/{skill-name}
node scripts/verify-skill-structure.mjs --all
```
