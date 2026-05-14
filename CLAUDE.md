# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Caudal** — a wealth planning web app. Users track net worth, run retirement simulations, take a risk profile quiz, and read financial blog posts. Built in Spanish (primary) and English.

Live at: deployed via S3 (`wealth-planner-app`) + CloudFront (`E3RXLLVE8CC0XQ`).

## Commands

```bash
# Development
npm run dev          # starts Vite dev server at localhost:5173

# Production
npm run build        # builds to dist/
npm run deploy       # build + S3 sync + CloudFront invalidation (one command)

# Lint
npx eslint src/
```

No test suite exists yet.

### Manual Lambda deploy

```bash
cd lambda
zip -j api-handler.zip api-handler.js
aws lambda update-function-code --function-name wealth-planner-api --zip-file fileb://api-handler.zip --region us-east-1
```

## Architecture

### Frontend (React + Vite)

Single-page app with no router — navigation is a `view` string in `App.jsx` state. `App.jsx` owns auth state (AWS Cognito via Amplify) and renders one view at a time.

**Views:** `landing` · `login` · `simulator` · `risk` · `networth` · `blog` · `about` · `brand`

**Auth:** `aws-amplify/auth` (`getCurrentUser`, `signOut`). NetWorth is the only view that requires login. The `user` object from Cognito (`user.username` = UUID sub) is passed to components that need it.

**i18n:** All UI strings live in `src/i18n.js` as `{ es, en }` pairs. Access via `const { t } = useLanguage()`. When adding any text, add both languages there — never hardcode strings in components.

**Theming:** dark/light, stored in `localStorage`. Applied as `data-theme` attribute on `<html>`.

### Backend (AWS Lambda + API Gateway)

Single Lambda function `wealth-planner-api` (`lambda/api-handler.js`) handles all API routes. Uses AWS SDK v3.

**Public endpoints** (no auth):
- `POST /feedback` — sends SES email + creates Notion page in the Caudal Feedback database
- `POST /error-report` — sends SES alert for frontend JS errors
- `GET /blog-posts` — reads from DynamoDB `wealth-planner-blog-posts`

**Authenticated endpoints** (JWT from Cognito via API Gateway authorizer, `userId` extracted from `event.requestContext.authorizer.jwt.claims.sub`):
- `/scenarios` — CRUD for saved simulator scenarios (DynamoDB `wealth-planner-scenarios`)
- `/networth` — CRUD for portfolio assets (DynamoDB `wealth-planner-networth`)
- `GET /stock-price?isin=...` — fetches price from Yahoo Finance via ISIN lookup
- `POST /refresh-prices` — bulk price refresh for all user assets

**Other Lambdas:**
- `wealth-planner-stock-updater` — daily EventBridge trigger, updates all prices
- `wealth-planner-blog-generator` — runs every 2 days, generates posts via Bedrock

### AWS infrastructure

| Resource | Name / ID |
|---|---|
| S3 bucket | `wealth-planner-app` |
| CloudFront | `E3RXLLVE8CC0XQ` |
| Cognito User Pool | `us-east-1_Nswd4eQYD` |
| API endpoint | `https://rkjlzbsc84.execute-api.us-east-1.amazonaws.com/prod` |
| Notion Feedback DB | `35d223ca0881815ea0c0e35ce3d5f2f1` |
| Alert email (SES) | `manugvd@gmail.com` |

Lambda env vars: `NOTION_TOKEN` (set via `aws lambda update-function-configuration`).

### Key patterns

- **CORS** is handled manually in the Lambda for every response — always include the `headers` object in returns.
- **Path stripping:** API Gateway prepends `/prod` to paths; the Lambda strips it with `rawPath.replace(/^\/prod/, '')`.
- **Price updates** hit Yahoo Finance directly (no third-party key needed) using a browser-like User-Agent.
- **Feedback → Notion:** `addFeedbackToNotion()` in the Lambda must be `await`ed — fire-and-forget doesn't work in Lambda.
