---
name: sharp-node22-override
description: Fix sharp@0.32 ERESOLVE failure on Node.js 22 by forcing sharp@0.33 via pnpm.overrides.
license: MIT
metadata:
  version: 1.0.0
  tags: [sharp, node22, pnpm, overrides, native-module]
  recommended_scope: project
  author: anonymous-contributor
  source: session-contribution
  session_tokens: 5000
  reproducibility: always
  time_saved: 15m
---

# sharp-node22-override

## Purpose

Fix `ERESOLVE` errors when running `pnpm install` on a project that depends on `sharp@0.32` with Node.js 22+. The `sharp@0.32` package includes prebuilt native binaries (libvips) that do not support Node.js 22, causing dependency resolution to fail. The fix is to force `sharp@0.33` (which supports Node 22) via `pnpm.overrides` in the root `package.json`.

## Triggers

Activate when **ALL** of the following are true:

- `pnpm install` fails with an `ERESOLVE` error
- The error involves `sharp` (any version below 0.33)
- The project runs on Node.js 22 or later

## Behavior

1. Open the root `package.json`
2. Add or update the `pnpm.overrides` field:

```json
{
  "pnpm": {
    "overrides": {
      "sharp": ">=0.33.0"
    }
  }
}
```

3. Run `pnpm install` again to verify the resolution succeeds
4. Verify sharp works at runtime: `node -e "require('sharp')"`

## Errors Prevented

- `ERESOLVE` — Could not resolve dependency `sharp@0.32.x` with Node.js 22+
- Build failures in CI/CD pipelines after upgrading Node.js to v22

## Restrictions

- Only apply this override when `sharp@0.32` (or earlier) is the problematic version
- If the project uses `sharp` directly, consider upgrading the direct dependency to `^0.33.0` instead of using an override
- Test image processing features after the upgrade — sharp 0.33 may have minor API changes

## Self-Check

- [ ] `pnpm install` completes without ERESOLVE errors
- [ ] `node -e "require('sharp')"` succeeds
- [ ] Image processing features work as expected

## Examples

### Before (fails)

```
$ node --version
v22.0.0
$ pnpm install
 ERESOLVE could not resolve
  sharp@0.32.6 requires node < 22
```

### After (works)

```json
// package.json
{
  "pnpm": {
    "overrides": {
      "sharp": ">=0.33.0"
    }
  }
}
```

```
$ pnpm install
Done in 12.3s
```
