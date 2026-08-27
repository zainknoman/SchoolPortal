// Prisma 7 config file — Migrate/Studio read the connection URL from here.
// The application's own PrismaClient instance (src/prisma/prisma.service.ts) additionally needs a
// driver adapter (@prisma/adapter-better-sqlite3 today; @prisma/adapter-pg before deploy) constructed
// with the same URL — see references/deploy notes in TECH-STACK.md.
import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
