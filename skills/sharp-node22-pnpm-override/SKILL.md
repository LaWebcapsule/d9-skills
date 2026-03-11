---
name: sharp-node22-pnpm-override
description: Fix pnpm install failure when sharp@0.32 is incompatible with Node 22 by forcing a compatible version via pnpm.overrides.
license: MIT
metadata:
  version: 1.0.0
  tags: [sharp, node22, pnpm, overrides, native-dependency]
  recommended_scope: project
  author: anonymous-contributor
  source: session-contribution
  reproducibility: always
  time_saved: 15m
---

# Fix sharp Compatibility with Node 22 via pnpm.overrides

## Purpose

Resolve `ERESOLVE` or peer dependency errors during `pnpm install` when `sharp@0.32` (or earlier) is pulled as a direct or transitive dependency on a Node.js 22+ runtime. `sharp@0.32` ships prebuilt native binaries that do not support Node 22's ABI. The fix is to force `sharp@0.33` (which adds Node 22 support) using `pnpm.overrides` in the root `package.json`.

## Triggers

- Running `pnpm install` on Node.js 22+ and getting an `ERESOLVE` error involving `sharp`.
- A Docker build fails at the `pnpm install` step with sharp-related native module errors on a Node 22 base image.
- Upgrading a project from Node 20 to Node 22 and encountering new dependency resolution failures.

## Behavior

1. **Identify the sharp version in the lockfile.** Check `pnpm-lock.yaml` or run `pnpm why sharp` to confirm `sharp@0.32.x` (or earlier) is being resolved.

2. **Check Node.js version.** Run `node -v` to confirm the runtime is v22.0.0 or later.

3. **Add a pnpm override in root `package.json`:**
   ```json
   {
     "pnpm": {
       "overrides": {
         "sharp": ">=0.33.0"
       }
     }
   }
   ```

4. **Reinstall dependencies:**
   ```bash
   pnpm install
   ```

5. **Verify sharp loads correctly:**
   ```bash
   node -e "require('sharp'); console.log('sharp OK')"
   ```

## Errors Prevented

- `ERESOLVE could not resolve` — pnpm cannot find a version of sharp compatible with the current Node.js ABI.
- `Error: Cannot find module '../build/Release/sharp-...node'` — sharp's prebuilt binary does not exist for the current Node.js version.
- Silent build failures in CI/CD pipelines when the base image is upgraded to Node 22.

## Restrictions

### Hard Boundaries
- Never pin sharp to a specific patch version in overrides (e.g., `0.33.2`); use `>=0.33.0` to allow minor/patch updates.
- Never downgrade Node.js solely to avoid this issue; the override is the correct forward-compatible fix.

### Soft Boundaries
- If sharp is a direct dependency, prefer updating it directly in `dependencies` rather than using an override.
- Check the sharp changelog for breaking API changes between 0.32 and 0.33 before applying the override.
- Remove the override once all upstream packages depend on sharp@0.33+ natively.

## Self-Check

- [ ] `pnpm why sharp` shows version 0.33.0 or later after applying the override.
- [ ] `node -e "require('sharp')"` succeeds on Node 22+.
- [ ] The override is in the root `package.json`, not in a workspace package.
- [ ] No sharp-related errors in `pnpm install` output.

## Examples

### Example 1: Upgrading a project from Node 20 to Node 22

**Scenario**: A project runs fine on Node 20. After switching to Node 22, `pnpm install` fails:

```
 ERESOLVE could not resolve
 While resolving: sharp@0.32.6
 Found: sharp@0.32.6
 Could not resolve dependency:
 peer engines node@">=14.15.0 <21.0.0"
```

**Diagnosis**: `sharp@0.32.6` declares engine support up to Node 20. Node 22 is outside the supported range.

**Fix applied**:

```json
{
  "pnpm": {
    "overrides": {
      "sharp": ">=0.33.0"
    }
  }
}
```

After `pnpm install`, sharp@0.33.x is resolved and the project builds successfully on Node 22.

### Example 2 (Edge Case): sharp is a transitive dependency

**Scenario**: The project does not depend on sharp directly, but a dependency (e.g., an image optimization plugin) pulls in `sharp@0.32`. `pnpm install` fails on Node 22.

**Diagnosis**: `pnpm why sharp` shows the dependency chain: `project -> image-plugin@2.1.0 -> sharp@0.32.6`.

**Fix applied**: The same `pnpm.overrides` approach works for transitive dependencies — the override forces sharp@0.33+ regardless of where in the tree it appears.

### Example 3 (Edge Case): Docker multi-stage build

**Scenario**: A Dockerfile uses `FROM node:22-slim` and runs `pnpm install`. The build fails at the install step with sharp ABI errors.

**Fix applied**: Add the override to `package.json` before building the image. The override applies at resolution time, so the lockfile is regenerated with sharp@0.33+ and the Docker build succeeds.
