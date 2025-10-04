-- DropForeignKey
ALTER TABLE "public"."sessions" DROP CONSTRAINT "sessions_activation_link_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_activation_link_id_fkey" FOREIGN KEY ("activation_link_id") REFERENCES "public"."activation_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;
