# AGENTS.md

Guidance for AI coding agents working with this repository.

> **Note:** `CLAUDE.md` is a symlink to this file.

## Repository Structure

```
skills/
  {skill-name}/
    SKILL.md              # Required: skill manifest (Agent Skills spec)
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

Skills are typically contributed via the SkillOps pipeline from the [d9 main repo](https://github.com/LaWebcapsule/directus9). Run `/skillops` after a debugging session.

## Validation

```bash
node scripts/verify-skill-structure.mjs skills/{skill-name}
node scripts/verify-skill-structure.mjs --all
```
