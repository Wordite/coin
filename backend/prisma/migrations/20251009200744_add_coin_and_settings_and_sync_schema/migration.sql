/*
  Warnings:

  - The values [SELECT,NUMBER,BOOLEAN,DATE] on the enum `FieldType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."CoinStatus" AS ENUM ('PRESALE', 'SOLD', 'ACTIVE');

-- CreateEnum
CREATE TYPE "public"."DocType" AS ENUM ('DOCUMENT', 'CATEGORY');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."FieldType_new" AS ENUM ('CONTENT', 'IMAGES', 'MARKDOWN', 'COMPLEX');
ALTER TABLE "public"."section_fields" ALTER COLUMN "type" TYPE "public"."FieldType_new" USING ("type"::text::"public"."FieldType_new");
ALTER TYPE "public"."FieldType" RENAME TO "FieldType_old";
ALTER TYPE "public"."FieldType_new" RENAME TO "FieldType";
DROP TYPE "public"."FieldType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."section_fields" ADD COLUMN     "text_fields_count" INTEGER,
ADD COLUMN     "with_image" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "transactions" JSONB DEFAULT '[]';

-- CreateTable
CREATE TABLE "public"."settings" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "site_name" TEXT NOT NULL DEFAULT 'CryptoHomayak',
    "site_logo" TEXT,
    "site_description" TEXT,
    "presale_end_date_time" TIMESTAMP(3),
    "presale_active" BOOLEAN NOT NULL DEFAULT false,
    "usdt_to_coin_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.001,
    "sol_to_coin_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.0001,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."docs_config" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'My Site',
    "tagline" TEXT NOT NULL DEFAULT 'Dinosaurs are cool',
    "navbar_title" TEXT NOT NULL DEFAULT 'My Site',
    "navbar_logo_src" TEXT NOT NULL DEFAULT 'img/logo.svg',
    "feature1_title" TEXT,
    "feature1_text" TEXT,
    "feature1_image" TEXT,
    "feature2_title" TEXT,
    "feature2_text" TEXT,
    "feature2_image" TEXT,
    "feature3_title" TEXT,
    "feature3_text" TEXT,
    "feature3_image" TEXT,
    "button_text" TEXT NOT NULL DEFAULT 'Read More',
    "button_link" TEXT NOT NULL DEFAULT '/docs',

    CONSTRAINT "docs_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coin" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "public"."CoinStatus" NOT NULL DEFAULT 'PRESALE',
    "sold_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "current_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stage" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL DEFAULT 'Coin',
    "decimals" INTEGER NOT NULL DEFAULT 6,
    "min_buy_amount" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "max_buy_amount" DOUBLE PRECISION NOT NULL DEFAULT 1000000,
    "mint_address" TEXT,

    CONSTRAINT "coin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contacts" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "fingerprint" TEXT NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documentation" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "type" "public"."DocType" NOT NULL DEFAULT 'DOCUMENT',
    "category_id" TEXT,
    "file_path" TEXT,
    "file_hash" TEXT,
    "last_synced_at" TIMESTAMP(3),
    "is_file_based" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "documentation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documentation_slug_key" ON "public"."documentation"("slug");

-- AddForeignKey
ALTER TABLE "public"."documentation" ADD CONSTRAINT "documentation_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."documentation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
