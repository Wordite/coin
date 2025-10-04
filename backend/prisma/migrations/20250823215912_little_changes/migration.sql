/*
  Warnings:

  - You are about to drop the column `registration_request_id` on the `activation_links` table. All the data in the column will be lost.
  - You are about to drop the column `registration_request_id` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `is_activated` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `registration_requests` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[authorization_request_id]` on the table `activation_links` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[authorization_request_id]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."activation_links" DROP CONSTRAINT "activation_links_registration_request_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."sessions" DROP CONSTRAINT "sessions_registration_request_id_fkey";

-- DropIndex
DROP INDEX "public"."activation_links_registration_request_id_key";

-- DropIndex
DROP INDEX "public"."sessions_registration_request_id_key";

-- AlterTable
ALTER TABLE "public"."activation_links" DROP COLUMN "registration_request_id",
ADD COLUMN     "authorization_request_id" TEXT;

-- AlterTable
ALTER TABLE "public"."sessions" DROP COLUMN "registration_request_id",
ADD COLUMN     "authorization_request_id" TEXT,
ADD COLUMN     "is_activated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "is_activated";

-- DropTable
DROP TABLE "public"."registration_requests";

-- CreateTable
CREATE TABLE "public"."authorization_requests" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activation_link_id" TEXT,

    CONSTRAINT "authorization_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authorization_requests_activation_link_id_key" ON "public"."authorization_requests"("activation_link_id");

-- CreateIndex
CREATE UNIQUE INDEX "activation_links_authorization_request_id_key" ON "public"."activation_links"("authorization_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_authorization_request_id_key" ON "public"."sessions"("authorization_request_id");

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_authorization_request_id_fkey" FOREIGN KEY ("authorization_request_id") REFERENCES "public"."authorization_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activation_links" ADD CONSTRAINT "activation_links_authorization_request_id_fkey" FOREIGN KEY ("authorization_request_id") REFERENCES "public"."authorization_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
