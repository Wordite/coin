/*
  Warnings:

  - You are about to drop the column `activation_link` on the `activation_links` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[link]` on the table `activation_links` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `link` to the `activation_links` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."activation_links_activation_link_key";

-- AlterTable
ALTER TABLE "public"."activation_links" DROP COLUMN "activation_link",
ADD COLUMN     "link" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "activation_links_link_key" ON "public"."activation_links"("link");
