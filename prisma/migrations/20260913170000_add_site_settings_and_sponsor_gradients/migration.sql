-- AlterTable
ALTER TABLE "Sponsor" ADD COLUMN     "accent" TEXT DEFAULT 'from-[#E65C00] to-[#FF7A00]',
ADD COLUMN     "blackLogoBg" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gradient" TEXT DEFAULT 'linear-gradient(135deg, #E65C00 0%, #FF7A00 100%)';

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default-settings',
    "siteTitle" TEXT NOT NULL DEFAULT 'Mana Indian Telugu Roots Abroad (MITRA)',
    "tagline" TEXT NOT NULL DEFAULT 'Serving and Connecting the Telugu Community in the United Kingdom',
    "contactEmail" TEXT NOT NULL DEFAULT 'info@mitra.org.uk',
    "contactPhone" TEXT NOT NULL DEFAULT '+44 20 8123 4567',
    "address" TEXT NOT NULL DEFAULT 'MITRA Centre, Chiswick Park, 566 Chiswick High Rd, London W4 5YA, United Kingdom',
    "twitterUrl" TEXT NOT NULL DEFAULT 'https://twitter.com/mitra_official',
    "linkedinUrl" TEXT NOT NULL DEFAULT 'https://linkedin.com/company/mitra-official',
    "facebookUrl" TEXT NOT NULL DEFAULT 'https://facebook.com/ukteluguassociation',
    "instagramUrl" TEXT NOT NULL DEFAULT 'https://instagram.com/mitra_official',
    "youtubeUrl" TEXT NOT NULL DEFAULT 'https://youtube.com/@mitraofficial',
    "googleAnalyticsId" TEXT NOT NULL DEFAULT 'G-MITRA2026SEO',
    "enableTracking" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
