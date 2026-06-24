/*
  Warnings:

  - Added the required column `status` to the `SocialAccount` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SocialAccountStatus" AS ENUM ('NEEDS_RECONNECTION', 'CONNECTED');

-- AlterTable
ALTER TABLE "SocialAccount" ADD COLUMN     "status" "SocialAccountStatus" NOT NULL;
