-- CreateTable
CREATE TABLE "BillingCreditGrant" (
    "provider" TEXT NOT NULL,
    "providerSubscriptionId" TEXT NOT NULL,
    "cycleKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingCreditGrant_pkey" PRIMARY KEY ("provider","providerSubscriptionId","cycleKey")
);

