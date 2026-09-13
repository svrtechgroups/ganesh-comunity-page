-- AlterTable
ALTER TABLE "MediaItem" ADD COLUMN IF NOT EXISTS "eventDisplayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "homeDisplayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "isEventFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "isHomeFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MediaItem_isHomeFeatured_idx" ON "MediaItem"("isHomeFeatured");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MediaItem_isEventFeatured_idx" ON "MediaItem"("isEventFeatured");
