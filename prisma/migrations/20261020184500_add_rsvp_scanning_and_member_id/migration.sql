-- AlterTable
ALTER TABLE "EventRSVP" ADD COLUMN     "isScanned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "memberId" TEXT,
ADD COLUMN     "scannedAt" TIMESTAMP(3),
ADD COLUMN     "scannedBy" TEXT,
ADD COLUMN     "scannedCount" INTEGER NOT NULL DEFAULT 0;
