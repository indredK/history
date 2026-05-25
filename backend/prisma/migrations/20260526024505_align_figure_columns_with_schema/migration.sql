-- Align figure-table columns with current schema.prisma
-- The columns below were added via `prisma db push` after the initial migrations,
-- so dev.db has them but new SQLite databases created from migrations do not.
-- This migration brings migration history in sync with the live schema so that
-- `prisma migrate deploy` + `prisma db seed` reproduces the same shape used in dev.

-- tang_figures: add 8 columns
ALTER TABLE "tang_figures" ADD COLUMN "courtesy" TEXT;
ALTER TABLE "tang_figures" ADD COLUMN "positions" JSONB;
ALTER TABLE "tang_figures" ADD COLUMN "faction" TEXT;
ALTER TABLE "tang_figures" ADD COLUMN "politicalViews" TEXT;
ALTER TABLE "tang_figures" ADD COLUMN "events" JSONB;
ALTER TABLE "tang_figures" ADD COLUMN "evaluations" JSONB;
ALTER TABLE "tang_figures" ADD COLUMN "portraitUrl" TEXT;
ALTER TABLE "tang_figures" ADD COLUMN "sources" JSONB;

-- song_figures: add 8 columns
ALTER TABLE "song_figures" ADD COLUMN "courtesy" TEXT;
ALTER TABLE "song_figures" ADD COLUMN "positions" JSONB;
ALTER TABLE "song_figures" ADD COLUMN "faction" TEXT;
ALTER TABLE "song_figures" ADD COLUMN "politicalViews" TEXT;
ALTER TABLE "song_figures" ADD COLUMN "events" JSONB;
ALTER TABLE "song_figures" ADD COLUMN "evaluations" JSONB;
ALTER TABLE "song_figures" ADD COLUMN "portraitUrl" TEXT;
ALTER TABLE "song_figures" ADD COLUMN "sources" JSONB;

-- yuan_figures: add 8 columns
ALTER TABLE "yuan_figures" ADD COLUMN "courtesy" TEXT;
ALTER TABLE "yuan_figures" ADD COLUMN "positions" JSONB;
ALTER TABLE "yuan_figures" ADD COLUMN "faction" TEXT;
ALTER TABLE "yuan_figures" ADD COLUMN "politicalViews" TEXT;
ALTER TABLE "yuan_figures" ADD COLUMN "events" JSONB;
ALTER TABLE "yuan_figures" ADD COLUMN "evaluations" JSONB;
ALTER TABLE "yuan_figures" ADD COLUMN "portraitUrl" TEXT;
ALTER TABLE "yuan_figures" ADD COLUMN "sources" JSONB;

-- ming_figures: add 8 columns
ALTER TABLE "ming_figures" ADD COLUMN "courtesy" TEXT;
ALTER TABLE "ming_figures" ADD COLUMN "positions" JSONB;
ALTER TABLE "ming_figures" ADD COLUMN "faction" TEXT;
ALTER TABLE "ming_figures" ADD COLUMN "politicalViews" TEXT;
ALTER TABLE "ming_figures" ADD COLUMN "events" JSONB;
ALTER TABLE "ming_figures" ADD COLUMN "evaluations" JSONB;
ALTER TABLE "ming_figures" ADD COLUMN "portraitUrl" TEXT;
ALTER TABLE "ming_figures" ADD COLUMN "sources" JSONB;

-- qing_rulers: add 13 columns
ALTER TABLE "qing_rulers" ADD COLUMN "templeName" TEXT;
ALTER TABLE "qing_rulers" ADD COLUMN "eraName" TEXT;
ALTER TABLE "qing_rulers" ADD COLUMN "courtesy" TEXT;
ALTER TABLE "qing_rulers" ADD COLUMN "positions" JSONB;
ALTER TABLE "qing_rulers" ADD COLUMN "faction" TEXT;
ALTER TABLE "qing_rulers" ADD COLUMN "politicalViews" TEXT;
ALTER TABLE "qing_rulers" ADD COLUMN "majorEvents" JSONB;
ALTER TABLE "qing_rulers" ADD COLUMN "events" JSONB;
ALTER TABLE "qing_rulers" ADD COLUMN "contribution" TEXT;
ALTER TABLE "qing_rulers" ADD COLUMN "responsibility" TEXT;
ALTER TABLE "qing_rulers" ADD COLUMN "evaluations" JSONB;
ALTER TABLE "qing_rulers" ADD COLUMN "portraitUrl" TEXT;
ALTER TABLE "qing_rulers" ADD COLUMN "sources" JSONB;

-- sanguo_figures: add 8 columns
ALTER TABLE "sanguo_figures" ADD COLUMN "courtesy" TEXT;
ALTER TABLE "sanguo_figures" ADD COLUMN "positions" JSONB;
ALTER TABLE "sanguo_figures" ADD COLUMN "faction" TEXT;
ALTER TABLE "sanguo_figures" ADD COLUMN "politicalViews" TEXT;
ALTER TABLE "sanguo_figures" ADD COLUMN "events" JSONB;
ALTER TABLE "sanguo_figures" ADD COLUMN "evaluations" JSONB;
ALTER TABLE "sanguo_figures" ADD COLUMN "portraitUrl" TEXT;
ALTER TABLE "sanguo_figures" ADD COLUMN "sources" JSONB;
