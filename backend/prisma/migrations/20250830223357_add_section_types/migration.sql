-- CreateEnum
CREATE TYPE "public"."FieldType" AS ENUM ('CONTENT', 'IMAGES', 'MARKDOWN', 'SELECT', 'NUMBER', 'BOOLEAN', 'DATE');

-- AlterTable
ALTER TABLE "public"."sections" ADD COLUMN     "section_type_id" TEXT;

-- CreateTable
CREATE TABLE "public"."section_types" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "section_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."section_fields" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."FieldType" NOT NULL,
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "multiple" BOOLEAN NOT NULL DEFAULT false,
    "max_selection" INTEGER,
    "defaultValue" TEXT,
    "validation" JSONB DEFAULT '{}',
    "order" INTEGER NOT NULL DEFAULT 0,
    "section_type_id" TEXT NOT NULL,

    CONSTRAINT "section_fields_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "section_types_name_key" ON "public"."section_types"("name");

-- AddForeignKey
ALTER TABLE "public"."sections" ADD CONSTRAINT "sections_section_type_id_fkey" FOREIGN KEY ("section_type_id") REFERENCES "public"."section_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."section_fields" ADD CONSTRAINT "section_fields_section_type_id_fkey" FOREIGN KEY ("section_type_id") REFERENCES "public"."section_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
