-- AlterTable
ALTER TABLE "Simulation" ADD COLUMN     "promptType" TEXT NOT NULL DEFAULT 'organic';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accessType" TEXT;

-- CreateTable
CREATE TABLE "BetaRequest" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "BetaRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Allowlist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "magicToken" TEXT,
    "magicTokenExpires" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "Allowlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BetaRequest_email_key" ON "BetaRequest"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Allowlist_email_key" ON "Allowlist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Allowlist_magicToken_key" ON "Allowlist"("magicToken");
