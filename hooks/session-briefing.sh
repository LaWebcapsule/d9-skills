#!/bin/bash
# session-briefing.sh — Generates a compact briefing from all plugin skills at session start.
# Runs as SessionStart hook — stdout is injected into Claude's context.
# Uses CLAUDE_PLUGIN_ROOT to locate skills within the plugin directory.

set -e

PLUGIN_DIR="${CLAUDE_PLUGIN_ROOT:-.}"
SKILLS_DIR="$PLUGIN_DIR/skills"

if [ ! -d "$SKILLS_DIR" ]; then
  echo "No skills directory found in plugin."
  exit 0
fi

echo "=== D9-SKILLS BRIEFING ==="
echo ""

# Count operational skills (exclude skillops pipeline)
OP_COUNT=$(find "$SKILLS_DIR" -maxdepth 2 -name "SKILL.md" -not -path "*/skillops/*" -type f 2>/dev/null | wc -l | tr -d ' ')
PIPE_COUNT=$(find "$SKILLS_DIR/skillops" -name "SKILL.md" -type f 2>/dev/null | wc -l | tr -d ' ')
echo "[$OP_COUNT operational skills + $PIPE_COUNT pipeline skills loaded]"
echo ""

# --- Operational skills — compact summary ---
echo "## Operational Skills"
echo ""
for skill_dir in "$SKILLS_DIR"/*/; do
  [ -f "$skill_dir/SKILL.md" ] || continue
  name=$(basename "$skill_dir")
  [ "$name" = "skillops" ] && continue
  desc=$(sed -n '/^description:/{ s/^description: *//; p; q; }' "$skill_dir/SKILL.md" 2>/dev/null)
  echo "- **$name**: $desc"
done
echo ""

# --- Pipeline skills (skillops/) — triggers summary ---
echo "## SkillOps Pipeline"
echo ""
echo "Flow: detect-xp -> match-existing -> anonymize-session -> format-skill -> refine-skill-design -> submit-skill -> curate-skills (CI)"
echo ""

if [ -d "$SKILLS_DIR/skillops" ]; then
  for skill_dir in "$SKILLS_DIR/skillops"/*/; do
    [ -f "$skill_dir/SKILL.md" ] || continue
    name=$(basename "$skill_dir")

    echo "### $name"

    # Extract first Triggers section only
    awk '
      /^```/ { in_code = !in_code; next }
      in_code { next }
      /^## Triggers$/ && !found { found=1; next }
      found && /^## / { exit }
      found { print }
    ' "$skill_dir/SKILL.md" 2>/dev/null | head -15

    if [ "$name" = "detect-xp" ]; then
      echo ""
      echo "CRITICAL: Check for capturable patterns after EVERY error resolution."
      echo "Tier 1 (ALWAYS propose): silent failures, platform traps, config gotchas"
      echo "Tier 2 (propose if clear): multi-step investigations, workarounds"
      echo "Tier 3 (batch at session end): minor tips, shortcuts"
    fi

    if [ "$name" = "submit-skill" ]; then
      echo ""
      echo "IMPORTANT: After format-skill, ALWAYS run submit-skill to automate git+PR."
      echo "Do NOT just show manual instructions — execute the branch/commit/push/PR flow."
    fi

    echo ""
  done
fi

echo "## Contribute"
echo "Had an interesting debugging session? Run **/d9-skills:skillops** to contribute your experience as a shared skill."
echo ""
echo "## Verification"
echo "- Structure: node scripts/verify-skill-structure.mjs --all (run from d9-skills plugin dir)"
echo ""
echo "=== END BRIEFING ==="
