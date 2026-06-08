-- Expand the base persons table so the unified people module can store
-- general biographical records, not only name/year/biography summaries.

ALTER TABLE "persons" ADD COLUMN "nameEn" TEXT;
ALTER TABLE "persons" ADD COLUMN "courtesy" TEXT;
ALTER TABLE "persons" ADD COLUMN "dynasty" TEXT;
ALTER TABLE "persons" ADD COLUMN "period" TEXT;
ALTER TABLE "persons" ADD COLUMN "gender" TEXT;
ALTER TABLE "persons" ADD COLUMN "birthMonth" INTEGER;
ALTER TABLE "persons" ADD COLUMN "deathMonth" INTEGER;
ALTER TABLE "persons" ADD COLUMN "birthplace" TEXT;
ALTER TABLE "persons" ADD COLUMN "roles" JSONB;
ALTER TABLE "persons" ADD COLUMN "aliases" JSONB;
ALTER TABLE "persons" ADD COLUMN "achievements" JSONB;
ALTER TABLE "persons" ADD COLUMN "works" JSONB;
ALTER TABLE "persons" ADD COLUMN "events" JSONB;
ALTER TABLE "persons" ADD COLUMN "evaluations" JSONB;
ALTER TABLE "persons" ADD COLUMN "portraitUrl" TEXT;
ALTER TABLE "persons" ADD COLUMN "sources" JSONB;
ALTER TABLE "persons" ADD COLUMN "confidence" REAL;

CREATE INDEX "persons_dynasty_idx" ON "persons"("dynasty");
CREATE INDEX "persons_birthYear_idx" ON "persons"("birthYear");
