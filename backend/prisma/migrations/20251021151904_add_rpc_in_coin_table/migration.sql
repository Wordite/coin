-- AlterTable
ALTER TABLE "public"."coin" ADD COLUMN     "rpc" TEXT NOT NULL DEFAULT 'https://api.mainnet-beta.solana.com';
