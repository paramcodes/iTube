---
name: verify-itube
description: "Drive the iTube web application and API live through headless Playwright automation to verify features, visual layouts, and user interactions."
---

# Verify iTube

This skill drives the live iTube full-stack application (Next.js web client on port 3000, Elysia API server on port 3001) using Playwright to inspect rendered components, interaction states, and user journeys.

## When to Reach for This Skill
- **Use for:** UI regressions, visual layout bugs, interactive components (search suggestions, drawer collapse, video scrubber, player controls, modal forms, comment composer), client-side route transitions, and end-to-end user proof.
- **Do not use for:** Pure backend logic (use `bun test apps/api`), Drizzle schema assertions (use `bun test packages/db`), type definitions (use `bun test packages/types`), or documentation/linter checks (use `bun run check`).

## 1. Doctor Check
Ensure processes are not already conflicting on ports 3000 and 3001:
```bash
fuser 3000/tcp || true
fuser 3001/tcp || true
```

## 2. Launching the Environment
Start both API and Web servers in background:
```bash
# Start API
cd apps/api && bun run src/index.ts > /tmp/api.log 2>&1 &
API_PID=$!

# Start Web Client
cd apps/web && bun run dev --port 3000 > /tmp/web.log 2>&1 &
WEB_PID=$!

# Wait for readiness
sleep 5
curl -s -I http://localhost:3000 | head -n 1
curl -s -I http://localhost:3001/api/feed | head -n 1
```

## 3. Driving Features
Run the full automated E2E test harness:
```bash
bun x playwright test e2e/itube-features.spec.ts
```

Or drive a specific feature test:
```bash
bun x playwright test e2e/itube-features.spec.ts -g "01 - Home Feed"
```

## 4. Evidence
Playwright outputs artifacts to:
- Screenshots: `e2e-evidence/screenshots/`
- Video recordings: `e2e-evidence/videos/`
- Failure traces: `test-results/`

## 5. Teardown
Clean up active background servers:
```bash
kill $API_PID $WEB_PID || true
fuser -k 3000/tcp || true
fuser -k 3001/tcp || true
```
