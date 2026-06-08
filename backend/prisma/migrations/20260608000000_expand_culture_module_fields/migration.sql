-- Expand culture module models to match the richer frontend culture experience.

-- philosophical_schools: display metadata and structured detail fields
ALTER TABLE "philosophical_schools" ADD COLUMN "name_en" TEXT;
ALTER TABLE "philosophical_schools" ADD COLUMN "founderEn" TEXT;
ALTER TABLE "philosophical_schools" ADD COLUMN "foundingPeriod" TEXT;
ALTER TABLE "philosophical_schools" ADD COLUMN "representativeFigures" JSONB;
ALTER TABLE "philosophical_schools" ADD COLUMN "classicWorks" JSONB;
ALTER TABLE "philosophical_schools" ADD COLUMN "influence" TEXT;
ALTER TABLE "philosophical_schools" ADD COLUMN "color" TEXT;
ALTER TABLE "philosophical_schools" ADD COLUMN "sources" JSONB;

-- scholars: frontend-compatible display metadata and source fields
ALTER TABLE "scholars" ADD COLUMN "name_en" TEXT;
ALTER TABLE "scholars" ADD COLUMN "dynasty" TEXT;
ALTER TABLE "scholars" ADD COLUMN "schoolOfThought" TEXT;
ALTER TABLE "scholars" ADD COLUMN "achievements" JSONB;
ALTER TABLE "scholars" ADD COLUMN "portraitUrl" TEXT;
ALTER TABLE "scholars" ADD COLUMN "sources" JSONB;

CREATE INDEX "scholars_schoolOfThought_idx" ON "scholars"("schoolOfThought");
