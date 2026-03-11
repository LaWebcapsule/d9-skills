---
name: submit-skill
description: Automate skill submission to d9-skills. Clones the repo to a temp dir, copies validated skill files, creates a PR.
license: MIT
metadata:
  version: "4.0.0"
  tags: [pipeline, skillops, meta-skill, git]
  author: la-webcapsule
  source: skillops-pipeline
---

# Skill: Submit Skill

## Purpose

Automate the "last mile" of the SkillOps pipeline: take validated skill files and create a GitHub Pull Request on the **`LaWebcapsule/d9-skills` repo**.

**Architecture**: This skill lives inside the d9-skills plugin itself. When triggered, it clones a fresh copy of d9-skills to a temp directory, creates a branch, copies the validated skill file, and opens a PR. This ensures the user's local plugin installation is never modified.

**Target repo**: `https://github.com/LaWebcapsule/d9-skills`

## Triggers

Activate when ALL of the following are true:
- A SKILL.md file has been validated by `format-skill` and scored >= 10 by quality check
- The user has approved the file for submission

Also activate when:
- The user explicitly asks to "submit", "push", or "open a PR" for skills
- `format-skill` finishes (intercept and automate the submission)

## Behavior

### Step 1: Identify skill files to submit

The skill file should already be written and validated by the preceding pipeline steps. Confirm with the user:
```
Ready to submit to LaWebcapsule/d9-skills:
  NEW:       <name>/SKILL.md (score: <N>/20)
  Session tokens: ~<N>

Submit? [Yes] [Edit first] [Cancel]
```

### Step 2: Validate before submitting

Run the verification script on the skill file:
```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/verify-skill-structure.mjs" "<path-to-skill-dir>"
```

If score < 10, STOP and hand off to `refine-skill-design`.

### Step 3: Clone d9-skills to a temp directory

```bash
TMPDIR=$(mktemp -d)
gh repo clone LaWebcapsule/d9-skills "$TMPDIR/d9-skills"
cd "$TMPDIR/d9-skills"
```

### Step 4: Create a skill branch and copy files

```bash
git checkout -b skill/<primary-skill-name>

# Copy the validated skill file into the repo
mkdir -p skills/<name>
cp <validated-skill-path>/SKILL.md skills/<name>/SKILL.md
```

### Step 5: Commit and push

```bash
git add skills/<name>/
git commit -m "skill: add <name>"
git push -u origin skill/<name>
```

For a single skill: `skill: add crlf-docker-entrypoint`
For multiple: `skill: add crlf-docker-entrypoint, pnpm-ci-true-docker`
For amendments: `skill: amend rebuild-plugins-before-deploy`

### Step 6: Create PR on d9-skills

```bash
gh pr create \
  --repo LaWebcapsule/d9-skills \
  --head skill/<name> \
  --title "skill: add <name>" \
  --body "<generated body>"
```

PR body structure:
```markdown
## Summary
- <count> new skill(s) / amendment(s) from a d9 debugging session
- <bullet point per skill with 1-line description>

## Token Economy
| Skill | Session Tokens | Est. Tokens Saved per Use |
|-------|---------------|--------------------------|
| <name> | <session_tokens from metadata> | <estimated> |

> Every time a developer avoids this debugging session thanks to this skill,
> the community saves approximately <total est.> tokens.

## Test plan
- [ ] Review each SKILL.md for accuracy
- [ ] Check anonymization (no PII, secrets, project names)
- [ ] Verify SKILL.md follows Agent Skills Open Standard
- [ ] Confirm PR contains ONLY skill files

Generated with [SkillOps Pipeline](https://github.com/LaWebcapsule/d9-skills)
```

### Step 7: Clean up and confirm

```bash
rm -rf "$TMPDIR"
```

Show confirmation:
```
PR created successfully!

  URL: https://github.com/LaWebcapsule/d9-skills/pull/<N>
  Target repo: LaWebcapsule/d9-skills
  Branch: skill/<name>
  Skills: <list>
  Session tokens: <total> (recorded in skill metadata)

  Your working directory is unchanged.
  The curate-on-pr CI on d9-skills will run automatically.

  Install: npx skills add LaWebcapsule/d9-skills
```

## Restrictions

### Hard boundaries
- NEVER push without explicit user confirmation
- NEVER force-push or push to main/master directly
- NEVER create a PR if skill validation fails (score < 10)
- NEVER include non-skill files in the PR
- NEVER modify the user's working directory or repo state
- Target repo is ALWAYS `LaWebcapsule/d9-skills` — hardcoded, not configurable
- Skills MUST follow the Agent Skills Open Standard format (name + description in frontmatter)

### Soft boundaries
- Prefer one PR per session (batch multiple skills together)
- Prefer descriptive branch names: `skill/crlf-docker-entrypoint` over `skill/new`
- If `gh` CLI is not available, show manual instructions
- Clean up the temp directory even if the PR creation fails

## Self-Check

- [ ] All skill files follow Agent Skills Open Standard (name + description in frontmatter)?
- [ ] Frontmatter `name` matches directory name?
- [ ] Used temp clone of d9-skills (not the user's local copy)?
- [ ] Only skill files in the commit (no other files leaked)?
- [ ] session_tokens field present in each skill's metadata?
- [ ] Commit message follows convention (`skill: add/amend <name>`)?
- [ ] PR targets `LaWebcapsule/d9-skills` repo?
- [ ] Used `--head` flag with `gh pr create`?
- [ ] User confirmed before push?
- [ ] Temp directory cleaned up?
- [ ] PR URL shown to user?

## Examples

### Example 1: Single new skill

```
Ready to submit to LaWebcapsule/d9-skills:
  NEW: crlf-docker-entrypoint/SKILL.md (score: 19/20)
  Session tokens: ~45,000

  Will clone LaWebcapsule/d9-skills to temp, create branch skill/crlf-docker-entrypoint,
  copy skills/crlf-docker-entrypoint/SKILL.md, commit, push, and open PR.

  Your working directory is NOT affected.

  Proceed? [Yes] [Edit first] [Cancel]
```

User says Yes:
  1. Clone d9-skills to /tmp
  2. Create branch skill/crlf-docker-entrypoint
  3. Copy SKILL.md into skills/crlf-docker-entrypoint/
  4. Commit + push + gh pr create --repo LaWebcapsule/d9-skills --head skill/crlf-docker-entrypoint
  5. Clean up temp
  6. Show PR URL

### Example 2: gh CLI not available

```
gh CLI not found. Manual steps:

  1. Clone: git clone https://github.com/LaWebcapsule/d9-skills.git /tmp/d9-skills
  2. Branch: cd /tmp/d9-skills && git checkout -b skill/crlf-docker-entrypoint
  3. Copy: cp <path>/SKILL.md skills/crlf-docker-entrypoint/SKILL.md
  4. Commit: git add skills/ && git commit -m "skill: add crlf-docker-entrypoint"
  5. Push: git push -u origin skill/crlf-docker-entrypoint
  6. Open PR: https://github.com/LaWebcapsule/d9-skills/compare/skill/crlf-docker-entrypoint
```
