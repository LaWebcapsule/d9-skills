# /skillops — Contribute your experience as a shared skill

You are running the SkillOps pipeline. This command orchestrates the full flow to capture a reusable pattern from the current session and submit it as a skill to this **d9-skills** plugin repo.

## Instructions

Execute the following steps **in order**, stopping at each user confirmation point. Do NOT skip steps or auto-approve.

### Step 1: Detect & Extract

Review the current conversation for reusable patterns (errors resolved, workarounds found, non-obvious configurations). Follow the trigger system from `detect-xp`:

- **Tier 1** (always capture): silent failures, platform traps, unexpected dependencies, config gotchas
- **Tier 2** (capture if clear): multi-step investigations, misleading errors, undocumented migrations
- **Tier 3** (minor): shortcuts, tips

Present each detected pattern to the user:

```
Detected patterns from this session:

  1. [summary] — Tier [N]
  2. [summary] — Tier [N]
  ...

Which patterns do you want to contribute?
[All] [Select by number] [None — cancel]
```

If no patterns are found in the conversation, tell the user and ask them to describe the experience manually.

### Step 2: Match against existing skills

Read all SKILL.md files in the `skills/` directory of the d9-skills plugin. Compare semantically. Follow `match-existing` to determine:

- **DUPLICATE** (>95% similar) → inform and skip (unless user overrides)
- **AMENDMENT** (70-95% similar) → show diff, ask if amendment or new
- **NEW** (<70% similar) → proceed as new skill

### Step 3: Anonymize & decontextualize

Follow `anonymize-session`:

1. Strip all PII, secrets, credentials, internal URLs
2. **Decontextualize**: generalize project-specific details into reusable patterns
3. Show the anonymized version with a list of replacements made
4. **WAIT for explicit user approval** before continuing

### Step 4: Format

Follow `format-skill` to generate a SKILL.md in **Agent Skills Open Standard** format:
- Only `name` and `description` are required in frontmatter
- `license`, `metadata` (version, tags, session_tokens, author) are optional
- Body: Purpose, Triggers, Behavior, Errors Prevented, Restrictions, Self-Check, Examples

**Include `session_tokens` in metadata.** Ask the user how many tokens were consumed in this session (visible in Claude Code's usage display), or estimate based on conversation length (~500 tokens per agent message exchange).

Preview the file content to the user. **WAIT for approval.**

### Step 5: Quality check

Write the file locally to `skills/<name>/SKILL.md` within the d9-skills plugin directory and run validation:
```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/verify-skill-structure.mjs" "${CLAUDE_PLUGIN_ROOT}/skills/<name>"
```

If score < 17, suggest improvements following `refine-skill-design`. If score < 10, do NOT proceed — fix first.

### Step 6: Submit (PR on d9-skills)

Follow `submit-skill` to automate the last mile. Since this plugin IS the d9-skills repo:

1. Show what will be submitted (files list)
2. **WAIT for user confirmation**
3. Clone `LaWebcapsule/d9-skills` to a temp directory (to avoid modifying the user's working repo)
4. Create branch `skill/<name>` in the clone
5. Copy the validated SKILL.md into `skills/<name>/` in the clone
6. Commit with message `skill: add <name>` (or `skill: amend <name>`)
7. Push and create PR via `gh pr create --repo LaWebcapsule/d9-skills --head skill/<name>`
8. Clean up temp directory
9. Show the PR URL

## Important

- **Every step requires user confirmation** — never auto-proceed
- **Nothing leaves the machine until Step 6** — all processing is local
- **The user can cancel at any point** — no side effects until the final push
- **The user's working repo is NEVER modified** — we use a temp clone for the PR
- **session_tokens tracks community value** — each skill's token cost helps quantify how much the community saves
- If this is a fresh session with no patterns to detect, ask the user to describe what they learned
