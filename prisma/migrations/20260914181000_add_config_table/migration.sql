-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL,
    "configKey" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "preference" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "dataType" TEXT NOT NULL DEFAULT 'string',
    "eventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Config_configKey_key" ON "Config"("configKey");

-- CreateIndex
CREATE INDEX "Config_prefix_idx" ON "Config"("prefix");

-- CreateIndex
CREATE INDEX "Config_eventId_idx" ON "Config"("eventId");

-- CreateIndex
CREATE INDEX "Config_preference_idx" ON "Config"("preference");

-- AddForeignKey
ALTER TABLE "Config" ADD CONSTRAINT "Config_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
