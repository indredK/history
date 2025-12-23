-- CreateTable
CREATE TABLE "dynasties" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "capital" TEXT,
    "founder" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "emperors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dynastyId" TEXT NOT NULL,
    "reignStart" INTEGER NOT NULL,
    "reignEnd" INTEGER,
    "templeName" TEXT,
    "posthumousName" TEXT,
    "eraNames" JSONB,
    "birthYear" INTEGER,
    "deathYear" INTEGER,
    "biography" TEXT,
    "achievements" JSONB,
    "historicalEvaluation" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "emperors_dynastyId_fkey" FOREIGN KEY ("dynastyId") REFERENCES "dynasties" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "scholars" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dynastyPeriod" TEXT,
    "birthYear" INTEGER,
    "deathYear" INTEGER,
    "philosophicalSchoolId" TEXT,
    "majorWorks" JSONB,
    "contributions" JSONB,
    "biography" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "scholars_philosophicalSchoolId_fkey" FOREIGN KEY ("philosophicalSchoolId") REFERENCES "philosophical_schools" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "philosophical_schools" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "founder" TEXT,
    "foundingYear" INTEGER,
    "coreBeliefs" JSONB,
    "keyTexts" JSONB,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tang_figures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dynastyId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "birthYear" INTEGER,
    "deathYear" INTEGER,
    "period" TEXT,
    "achievements" JSONB,
    "works" JSONB,
    "biography" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tang_figures_dynastyId_fkey" FOREIGN KEY ("dynastyId") REFERENCES "dynasties" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "song_figures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dynastyId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "birthYear" INTEGER,
    "deathYear" INTEGER,
    "period" TEXT,
    "achievements" JSONB,
    "works" JSONB,
    "biography" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "song_figures_dynastyId_fkey" FOREIGN KEY ("dynastyId") REFERENCES "dynasties" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "yuan_figures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dynastyId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "birthYear" INTEGER,
    "deathYear" INTEGER,
    "ethnicity" TEXT,
    "achievements" JSONB,
    "works" JSONB,
    "biography" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "yuan_figures_dynastyId_fkey" FOREIGN KEY ("dynastyId") REFERENCES "dynasties" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ming_figures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dynastyId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "birthYear" INTEGER,
    "deathYear" INTEGER,
    "period" TEXT,
    "achievements" JSONB,
    "works" JSONB,
    "biography" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ming_figures_dynastyId_fkey" FOREIGN KEY ("dynastyId") REFERENCES "dynasties" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "qing_rulers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dynastyId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "reignStart" INTEGER,
    "reignEnd" INTEGER,
    "birthYear" INTEGER,
    "deathYear" INTEGER,
    "achievements" JSONB,
    "policies" JSONB,
    "biography" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "qing_rulers_dynastyId_fkey" FOREIGN KEY ("dynastyId") REFERENCES "dynasties" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sanguo_figures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "kingdom" TEXT NOT NULL,
    "birthYear" INTEGER,
    "deathYear" INTEGER,
    "achievements" JSONB,
    "battles" JSONB,
    "biography" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "mythologies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "origin" TEXT,
    "period" TEXT,
    "description" TEXT,
    "stories" JSONB,
    "symbolism" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "religion_nodes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL,
    "tradition" TEXT NOT NULL,
    "description" TEXT,
    "period" TEXT,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "religion_edges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "strength" REAL,
    "period" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "religion_edges_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "religion_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "religion_edges_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "religion_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "dynasties_name_key" ON "dynasties"("name");

-- CreateIndex
CREATE INDEX "dynasties_startYear_idx" ON "dynasties"("startYear");

-- CreateIndex
CREATE INDEX "emperors_dynastyId_idx" ON "emperors"("dynastyId");

-- CreateIndex
CREATE INDEX "emperors_reignStart_idx" ON "emperors"("reignStart");

-- CreateIndex
CREATE INDEX "scholars_name_idx" ON "scholars"("name");

-- CreateIndex
CREATE INDEX "scholars_dynastyPeriod_idx" ON "scholars"("dynastyPeriod");

-- CreateIndex
CREATE UNIQUE INDEX "philosophical_schools_name_key" ON "philosophical_schools"("name");

-- CreateIndex
CREATE INDEX "philosophical_schools_name_idx" ON "philosophical_schools"("name");

-- CreateIndex
CREATE INDEX "tang_figures_dynastyId_idx" ON "tang_figures"("dynastyId");

-- CreateIndex
CREATE INDEX "tang_figures_role_idx" ON "tang_figures"("role");

-- CreateIndex
CREATE INDEX "song_figures_dynastyId_idx" ON "song_figures"("dynastyId");

-- CreateIndex
CREATE INDEX "song_figures_role_idx" ON "song_figures"("role");

-- CreateIndex
CREATE INDEX "yuan_figures_dynastyId_idx" ON "yuan_figures"("dynastyId");

-- CreateIndex
CREATE INDEX "yuan_figures_role_idx" ON "yuan_figures"("role");

-- CreateIndex
CREATE INDEX "ming_figures_dynastyId_idx" ON "ming_figures"("dynastyId");

-- CreateIndex
CREATE INDEX "ming_figures_role_idx" ON "ming_figures"("role");

-- CreateIndex
CREATE INDEX "qing_rulers_dynastyId_idx" ON "qing_rulers"("dynastyId");

-- CreateIndex
CREATE INDEX "qing_rulers_role_idx" ON "qing_rulers"("role");

-- CreateIndex
CREATE INDEX "sanguo_figures_kingdom_idx" ON "sanguo_figures"("kingdom");

-- CreateIndex
CREATE INDEX "sanguo_figures_role_idx" ON "sanguo_figures"("role");

-- CreateIndex
CREATE INDEX "mythologies_category_idx" ON "mythologies"("category");

-- CreateIndex
CREATE INDEX "mythologies_origin_idx" ON "mythologies"("origin");

-- CreateIndex
CREATE INDEX "religion_nodes_nodeType_idx" ON "religion_nodes"("nodeType");

-- CreateIndex
CREATE INDEX "religion_nodes_tradition_idx" ON "religion_nodes"("tradition");

-- CreateIndex
CREATE INDEX "religion_edges_sourceNodeId_idx" ON "religion_edges"("sourceNodeId");

-- CreateIndex
CREATE INDEX "religion_edges_targetNodeId_idx" ON "religion_edges"("targetNodeId");

-- CreateIndex
CREATE UNIQUE INDEX "religion_edges_sourceNodeId_targetNodeId_relationship_key" ON "religion_edges"("sourceNodeId", "targetNodeId", "relationship");
