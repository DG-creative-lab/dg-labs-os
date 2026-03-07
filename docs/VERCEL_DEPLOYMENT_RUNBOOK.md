# Vercel Deployment Runbook

## Goal

Deploy DG-Labs OS safely to Vercel with reproducible env configuration, runtime health checks, and a rollback path.

## 1) Environment Matrix

### Server-only secrets (Vercel Project -> Settings -> Environment Variables)

- `OPENROUTER_API_KEY` (recommended default)
- `OPENAI_API_KEY` (optional)
- `ANTHROPIC_API_KEY` (optional)
- `GEMINI_API_KEY` (optional)
- `SUPABASE_URL` (if Contact API is enabled)
- `SUPABASE_SERVICE_ROLE_KEY` (if Contact API is enabled)

### Public variables

- `PUBLIC_SITE_URL` (recommended for SEO and canonical links)
- `PUBLIC_SITE_NAME` (optional; request header metadata)

## 2) Branch and Deploy Policy

- `main` branch deploys to Production.
- Feature branches deploy to Preview.
- Use Node.js `24` locally for closest parity with Vercel Serverless Functions.
- Required checks before merge:
  - `pnpm check`
  - `pnpm build`
  - E2E smoke (`pnpm test:e2e:smoke`) in CI

## 3) Pre-deploy Checklist

Run locally before pushing:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm deploy:preflight
pnpm build:vercel
```

Verify no secrets are committed:

```bash
git ls-files | rg -n "^\\.env"
```

Expected: only `.env.example`.

## 4) Post-deploy Smoke Checks

After Preview/Production deployment:

1. `GET /desktop` loads shell and dock.
2. `GET /apps/network` loads graph (list/graph toggle works).
3. `GET /apps/terminal` loads Agents Runtime.
4. Terminal chat:
   - run one deterministic command (`help`)
   - run one LLM command (`ask what is dg-labs os`)
5. Provider diagnostics:
   - `GET /api/llm/health?probe=0` returns provider status array
   - optional `POST /api/llm/health` probe for selected provider

## 5) Runtime Expectations

- Astro adapter behavior:
  - local/default build -> `@astrojs/node` standalone adapter
  - Vercel build -> `@astrojs/vercel/serverless` when `DEPLOY_TARGET=vercel` or `VERCEL=1`
- Provider fallback is opt-in and capability-aware:
  - only applies when terminal setting `provider fallback` is enabled
  - only attempts providers with configured server keys
- BYOK remains user-scoped at runtime:
  - session-only by default
  - optional local browser persistence (explicit user toggle)

## 6) Rollback Procedure

If Production deploy regresses:

1. In Vercel dashboard, open project deployments.
2. Promote previous known-good deployment to Production.
3. Disable problematic env var changes if relevant.
4. Open follow-up fix PR with failing scenario documented.

## 7) Observability/Diagnostics

- Use Vercel function logs for `/api/chat` and `/api/llm/health`.
- Watch for:
  - `CONFIG_ERROR` (missing provider key)
  - `TIMEOUT` (provider latency/availability)
  - `INVALID_RESPONSE` (provider contract drift)

## 8) Security Notes

- Never expose provider API keys in `PUBLIC_*` vars.
- Keep `.env` and `.env.local` out of git.
- If a key is leaked:
  - rotate key at provider
  - remove from history if committed
  - redeploy with new secret.
