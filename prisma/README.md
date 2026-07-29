# Prisma Database Directory Guidelines

## 🚨 MANDATORY NOTICE: DO NOT RE-SEED OR RESET LIVE DATABASE

The live PostgreSQL database contains custom product injections, custom sleeve patches, custom player stocks, and dynamic inventory entries created live by the admin through the Command Centre (`/admin`).

> **CRITICAL DIRECTIVE**:
> - **DO NOT** execute `npm run db:seed` or `npx prisma db push --force-reset`.
> - **DO NOT** reset or wipe the database tables.
> - **ALWAYS ASK THE ADMIN FIRST** before making any schema changes, migrations, or database updates.
