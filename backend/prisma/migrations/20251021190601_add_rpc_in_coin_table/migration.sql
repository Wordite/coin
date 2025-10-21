-- AlterTable
ALTER TABLE "public"."coin" ADD COLUMN     "read_rate_limit" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "rpc_endpoints" JSONB,
ADD COLUMN     "write_rate_limit" INTEGER NOT NULL DEFAULT 3;
