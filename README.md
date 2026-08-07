# Review Maintain

Production-minded starter for a Google Business Profile review-management SaaS.

## What Is Included

- `apps/web`: Next.js dashboard with reviews, analytics, automation, and CRM surfaces.
- `apps/api`: NestJS API skeleton for OAuth, businesses, reviews, analytics, AI replies, and automation.
- `apps/worker`: BullMQ worker foundation for review sync and AI reply jobs.
- `packages/database`: Prisma schema for the core SaaS data model.
- `packages/shared`: Shared TypeScript contracts used by the apps.

## Run Locally

```bash
npm install
cp .env.example .env
docker compose up -d
npm run prisma:generate
npm run dev
```

Frontend: `http://localhost:3000`

API: `http://localhost:4000`

## MVP Roadmap

1. Configure Google Cloud OAuth consent, enable Google Business Profile APIs, and wire callback persistence.
2. Add Prisma migrations and seed a test organization/business.
3. Add Prisma-backed API services for businesses, locations, reviews, automation rules, and analytics.
4. Implement scheduled review sync jobs using BullMQ and Redis.
5. Add Gemini JSON-output prompts for reply drafts, sentiment, keywords, and spam flags.
6. Add role-based access, audit logs, token encryption, rate limits, and billing before production launch.
