---
name: Seed runner
description: How to run TypeScript seed scripts against the database in this monorepo
---

The monorepo does not expose `tsx` on PATH. The working seed invocation is:

```
cd /home/runner/workspace/lib/db && \
  NODE_PATH=/home/runner/workspace/node_modules/.pnpm/tsx@4.23.0/node_modules \
  node --import /home/runner/workspace/node_modules/.pnpm/tsx@4.23.0/node_modules/tsx/dist/esm/index.cjs \
  src/seed.ts
```

**Why:** tsx is a devDependency of scripts/ and Vite's internal bundle, not the db package. Running seed from `/home/runner/workspace/scripts/` fails because drizzle-orm is not found there. Running from `/lib/db/` with an explicit tsx import path works because drizzle-orm is in that package's deps.

**How to apply:** Any time a new seed or migration script needs to run against the live DB, place it in `lib/db/src/` and invoke it with the command above. The db `package.json` also has a `seed` script entry using `node --import tsx/esm` but that requires tsx to be a direct dependency of @workspace/db — use the explicit path form instead until tsx is added to lib/db devDeps.
