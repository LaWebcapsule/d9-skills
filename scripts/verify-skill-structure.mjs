#!/usr/bin/env node
/**
 * verify-skill-structure.mjs
 * Validates SKILL.md files against the Agent Skills Open Standard.
 *
 * Usage:
 *   node scripts/verify-skill-structure.mjs skills/rebuild-plugins-before-deploy
 *   node scripts/verify-skill-structure.mjs --all
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const REQUIRED_FRONTMATTER = ['name', 'description'];
const RECOMMENDED_FRONTMATTER = ['license', 'metadata'];
const RECOMMENDED_SECTIONS = ['Purpose', 'Triggers', 'Behavior', 'Restrictions', 'Self-Check', 'Examples'];

function parseFrontmatter(content) {
  content = content.replace(/\r\n/g, '\n');
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content, error: 'No YAML frontmatter found' };

  const yaml = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of yaml.split('\n')) {
    // Match keys with values on the same line
    const kv = line.match(/^(\w[\w-]*):\s*(.+)/);
    if (kv) { frontmatter[kv[1]] = kv[2].trim(); continue; }
    // Match keys with no inline value (e.g., "metadata:" followed by indented children)
    const keyOnly = line.match(/^(\w[\w-]*):\s*$/);
    if (keyOnly) frontmatter[keyOnly[1]] = '{}';
  }

  return { frontmatter, body, error: null };
}

function extractSections(body) {
  const sections = [];
  const lines = body.split('\n');
  for (const line of lines) {
    const match = line.match(/^##\s+(.+)/);
    if (match) sections.push(match[1].trim());
  }
  return sections;
}

function validateSkill(skillDir) {
  const skillPath = join(skillDir, 'SKILL.md');
  const errors = [];
  const warnings = [];

  let content;
  try {
    content = readFileSync(skillPath, 'utf-8');
  } catch {
    errors.push(`SKILL.md not found in ${skillDir}`);
    return { errors, warnings, score: 0 };
  }

  if (content.trim().length === 0) {
    errors.push('SKILL.md is empty');
    return { errors, warnings, score: 0 };
  }

  // Parse frontmatter
  const { frontmatter, body, error } = parseFrontmatter(content);
  if (error) errors.push(error);

  // Check required frontmatter fields (Agent Skills standard)
  for (const field of REQUIRED_FRONTMATTER) {
    if (!frontmatter[field]) {
      errors.push(`Missing required frontmatter field: ${field}`);
    }
  }

  // Validate name format (Agent Skills standard: lowercase, hyphens, 1-64 chars)
  if (frontmatter.name) {
    const name = frontmatter.name;
    if (name.length > 64) errors.push(`Name exceeds 64 characters: ${name.length}`);
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name) && name.length > 1) {
      errors.push(`Name must be lowercase alphanumeric with hyphens: ${name}`);
    }
    if (/--/.test(name)) errors.push(`Name must not contain consecutive hyphens: ${name}`);

    // Check name matches directory
    const dirName = skillDir.split(/[/\\]/).pop();
    if (name !== dirName) {
      errors.push(`Frontmatter name "${name}" doesn't match directory name "${dirName}"`);
    }
  }

  // Validate description length
  if (frontmatter.description && frontmatter.description.length > 1024) {
    errors.push(`Description exceeds 1024 characters: ${frontmatter.description.length}`);
  }

  // Check recommended frontmatter
  for (const field of RECOMMENDED_FRONTMATTER) {
    if (!frontmatter[field]) {
      warnings.push(`Missing recommended frontmatter field: ${field}`);
    }
  }

  // Check sections
  const sections = extractSections(body);

  for (const rec of RECOMMENDED_SECTIONS) {
    const found = sections.some(s =>
      s.toLowerCase().includes(rec.toLowerCase()) ||
      s.toLowerCase().replace(/[^a-z]/g, '').includes(rec.toLowerCase().replace(/[^a-z]/g, ''))
    );
    if (!found) warnings.push(`Missing recommended section: ## ${rec}`);
  }

  // Check self-check has checkboxes
  const selfCheckMatch = body.match(/## Self-Check[\s\S]*?(?=\n## |$)/);
  if (selfCheckMatch) {
    const checkboxes = (selfCheckMatch[0].match(/- \[ \]/g) || []).length;
    if (checkboxes < 3) warnings.push(`Self-Check has only ${checkboxes} items (recommend >= 3)`);
  }

  // Check body length (Agent Skills recommends < 500 lines)
  const bodyLines = body.split('\n').length;
  if (bodyLines > 500) {
    warnings.push(`SKILL.md body has ${bodyLines} lines (recommend < 500, use references/ for details)`);
  }

  // Calculate quality score
  let score = 20;
  score -= errors.length * 3;
  score -= warnings.length * 1;
  score = Math.max(0, Math.min(20, score));

  return { errors, warnings, score };
}

function findAllSkillDirs(baseDir) {
  const dirs = [];
  try {
    for (const skill of readdirSync(baseDir)) {
      const skillPath = join(baseDir, skill);
      if (statSync(skillPath).isDirectory()) {
        dirs.push(skillPath);
      }
    }
  } catch { /* empty */ }
  return dirs;
}

// Main
const args = process.argv.slice(2);
let skillDirs = [];

if (args.includes('--all')) {
  const base = resolve('skills');
  skillDirs = findAllSkillDirs(base).filter(d => d.split(/[/\\]/).pop() !== 'skillops');
  // Also scan skills/skillops/ subdirectories
  const pipelineBase = join(base, 'skillops');
  skillDirs = skillDirs.concat(findAllSkillDirs(pipelineBase));
} else if (args.length > 0) {
  skillDirs = args.map(a => resolve(a));
} else {
  console.log('Usage: node scripts/verify-skill-structure.mjs <skill-dir> [--all]');
  process.exit(1);
}

let hasErrors = false;

for (const dir of skillDirs) {
  const name = dir.split(/[/\\]/).pop();
  const { errors, warnings, score } = validateSkill(dir);

  const status = errors.length === 0 ? '\u2705' : '\u274C';
  console.log(`\n${status} ${name} (score: ${score}/20)`);

  for (const e of errors) console.log(`  \u274C ${e}`);
  for (const w of warnings) console.log(`  \u26A0\uFE0F  ${w}`);

  if (errors.length > 0) hasErrors = true;
}

console.log(`\n${skillDirs.length} skill(s) checked.`);
process.exit(hasErrors ? 1 : 0);
