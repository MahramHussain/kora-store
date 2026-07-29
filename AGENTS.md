# AGENTS.md - Critical Operational Rules for Kora Store

## 🚨 MANDATORY DATABASE RULE - DO NOT RESET OR RE-SEED DATABASE

> [!CAUTION]
> **LIVE ADMIN INJECTIONS IN DATABASE**:
> The live database contains custom product injections, custom sleeve patches, custom player stocks, and dynamic inventory items added directly by the admin via the Command Centre (`/admin`).
> These live custom injections **ARE NOT LISTED** in `prisma/products.json` or `prisma/seed.ts`.
>
> **STRICT DIRECTIVE FOR ALL AGENTS & AI ASSISTANTS**:
> 1. **NEVER** run `npm run db:seed`, `npx prisma db seed`, `npx prisma db push --force-reset`, `npx prisma migrate reset`, or any script that drops, wipes, overwrites, or re-seeds database product records.
> 2. **ALWAYS ASK THE ADMIN FOR EXPLICIT CONFIRMATION AND APPROVAL** before executing any command, running any script, or writing code that alters, mutates, migrates, or touches database tables or records.
> 3. Treat the live database as the authoritative single source of truth for all active products, inventory stock, and custom admin injections.
