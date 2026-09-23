-- AlterTable
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "eventSchedule" JSONB DEFAULT '[]';
