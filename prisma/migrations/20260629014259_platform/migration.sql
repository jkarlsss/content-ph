/*
  Warnings:

  - You are about to drop the `idea_groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ideas` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'TWITTER', 'LINKEDIN', 'TIKTOK');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('PROMOTIONAL', 'ANNOUNCEMENT', 'ENGAGEMENT', 'EDUCATIONAL', 'BEHIND_THE_SCENES');

-- CreateEnum
CREATE TYPE "Tone" AS ENUM ('PROFESSIONAL', 'CASUAL', 'PLAYFUL', 'LUXURY', 'URGENT');

-- DropForeignKey
ALTER TABLE "ideas" DROP CONSTRAINT "ideas_groupId_fkey";

-- DropForeignKey
ALTER TABLE "ideas" DROP CONSTRAINT "ideas_userId_fkey";

-- DropTable
DROP TABLE "idea_groups";

-- DropTable
DROP TABLE "ideas";

-- CreateTable
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "businessName" TEXT,
    "niche" TEXT NOT NULL,
    "audience" TEXT,
    "platforms" "Platform"[],
    "postType" "PostType" NOT NULL,
    "tone" "Tone" NOT NULL,
    "postCount" INTEGER NOT NULL DEFAULT 1,
    "keyDetails" TEXT,
    "cta" TEXT,
    "includeHashtags" BOOLEAN NOT NULL DEFAULT true,
    "includeEmojis" BOOLEAN NOT NULL DEFAULT true,
    "generatedPosts" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Idea_userId_idx" ON "Idea"("userId");

-- CreateIndex
CREATE INDEX "Idea_userId_createdAt_idx" ON "Idea"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
