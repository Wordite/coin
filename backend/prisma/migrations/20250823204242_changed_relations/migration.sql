/*
  Warnings:

  - You are about to drop the column `session_id` on the `registration_requests` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[registration_request_id]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."activation_links" DROP CONSTRAINT "activation_links_registration_request_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."registration_requests" DROP CONSTRAINT "registration_requests_session_id_fkey";

-- DropIndex
DROP INDEX "public"."registration_requests_session_id_key";

-- AlterTable
ALTER TABLE "public"."registration_requests" DROP COLUMN "session_id";

-- AlterTable
ALTER TABLE "public"."sessions" ADD COLUMN     "registration_request_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "sessions_registration_request_id_key" ON "public"."sessions"("registration_request_id");

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_registration_request_id_fkey" FOREIGN KEY ("registration_request_id") REFERENCES "public"."registration_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activation_links" ADD CONSTRAINT "activation_links_registration_request_id_fkey" FOREIGN KEY ("registration_request_id") REFERENCES "public"."registration_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
