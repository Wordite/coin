/*
  Warnings:

  - You are about to drop the column `userId` on the `activation_links` table. All the data in the column will be lost.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[registration_request_id]` on the table `activation_links` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'MANAGER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "public"."activation_links" DROP CONSTRAINT "activation_links_userId_fkey";

-- AlterTable
ALTER TABLE "public"."activation_links" DROP COLUMN "userId",
ADD COLUMN     "registration_request_id" TEXT;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "role",
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "public"."registration_requests" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activation_link_id" TEXT,
    "session_id" TEXT,

    CONSTRAINT "registration_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "registration_requests_activation_link_id_key" ON "public"."registration_requests"("activation_link_id");

-- CreateIndex
CREATE UNIQUE INDEX "registration_requests_session_id_key" ON "public"."registration_requests"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "activation_links_registration_request_id_key" ON "public"."activation_links"("registration_request_id");

-- AddForeignKey
ALTER TABLE "public"."registration_requests" ADD CONSTRAINT "registration_requests_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activation_links" ADD CONSTRAINT "activation_links_registration_request_id_fkey" FOREIGN KEY ("registration_request_id") REFERENCES "public"."registration_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
