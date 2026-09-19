-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "capacityAlertSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "childTicketPrice" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "enablePooja" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enableRsvp" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enableSupportPayment" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enforceCapacityLimit" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "EventRSVP" ADD COLUMN     "paymentIntentId" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'Free',
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "TeluguBusiness" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'IT & Software Services',
    "tagline" TEXT,
    "description" TEXT NOT NULL,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT NOT NULL DEFAULT 'London',
    "postcode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "specialOffer" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeluguBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeluguBusiness_status_idx" ON "TeluguBusiness"("status");

-- CreateIndex
CREATE INDEX "TeluguBusiness_category_idx" ON "TeluguBusiness"("category");

-- CreateIndex
CREATE INDEX "TeluguBusiness_city_idx" ON "TeluguBusiness"("city");
