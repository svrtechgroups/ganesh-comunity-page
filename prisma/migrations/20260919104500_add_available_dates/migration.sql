-- AlterTable
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "availableDates" TEXT[] DEFAULT ARRAY[]::TEXT[];
