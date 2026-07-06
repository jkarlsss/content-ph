/*
  Warnings:

  - You are about to drop the column `accessToken` on the `user_channels` table. All the data in the column will be lost.
  - You are about to drop the column `channelType` on the `user_channels` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `user_channels` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `user_channels` table. All the data in the column will be lost.
  - You are about to drop the column `isConnected` on the `user_channels` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `user_channels` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user_channels` table. All the data in the column will be lost.
  - You are about to drop the `Idea` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MetaConnection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MetaOAuthState` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MetaPage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organization_member` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `schedule_posts` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `access_token` to the `user_channels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `channel_type_id` to the `user_channels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user_channels` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Idea" DROP CONSTRAINT "Idea_userId_fkey";

-- DropForeignKey
ALTER TABLE "MetaConnection" DROP CONSTRAINT "MetaConnection_userId_fkey";

-- DropForeignKey
ALTER TABLE "MetaOAuthState" DROP CONSTRAINT "MetaOAuthState_userId_fkey";

-- DropForeignKey
ALTER TABLE "MetaPage" DROP CONSTRAINT "MetaPage_connectionId_fkey";

-- DropForeignKey
ALTER TABLE "organization_member" DROP CONSTRAINT "organization_member_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "organization_member" DROP CONSTRAINT "organization_member_userId_fkey";

-- DropForeignKey
ALTER TABLE "schedule_posts" DROP CONSTRAINT "schedule_posts_userChannelId_fkey";

-- DropForeignKey
ALTER TABLE "schedule_posts" DROP CONSTRAINT "schedule_posts_userId_fkey";

-- DropIndex
DROP INDEX "user_channels_channelType_idx";

-- DropIndex
DROP INDEX "user_channels_userId_idx";

-- AlterTable
ALTER TABLE "user_channels" DROP COLUMN "accessToken",
DROP COLUMN "channelType",
DROP COLUMN "createdAt",
DROP COLUMN "isActive",
DROP COLUMN "isConnected",
DROP COLUMN "profileImage",
DROP COLUMN "updatedAt",
ADD COLUMN     "access_token" TEXT NOT NULL,
ADD COLUMN     "channel_type_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_connected" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "profile_image" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Idea";

-- DropTable
DROP TABLE "MetaConnection";

-- DropTable
DROP TABLE "MetaOAuthState";

-- DropTable
DROP TABLE "MetaPage";

-- DropTable
DROP TABLE "organization";

-- DropTable
DROP TABLE "organization_member";

-- DropTable
DROP TABLE "schedule_posts";

-- DropEnum
DROP TYPE "ChannelType";

-- DropEnum
DROP TYPE "Platform";

-- DropEnum
DROP TYPE "PostStatus";

-- DropEnum
DROP TYPE "PostType";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "SocialAccountStatus";

-- DropEnum
DROP TYPE "Tone";

-- CreateTable
CREATE TABLE "channel_types" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "character_limit" INTEGER NOT NULL DEFAULT 2200,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channel_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idea_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idea_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ideas" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ideas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_posts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_channel_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "published_at" TIMESTAMP(3),
    "published_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,
    "stripe_subscription_id" TEXT NOT NULL,
    "plan_tier" TEXT NOT NULL DEFAULT 'FREE',
    "status" TEXT NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "channel_types_type_key" ON "channel_types"("type");

-- CreateIndex
CREATE UNIQUE INDEX "idea_groups_name_key" ON "idea_groups"("name");

-- AddForeignKey
ALTER TABLE "user_channels" ADD CONSTRAINT "user_channels_channel_type_id_fkey" FOREIGN KEY ("channel_type_id") REFERENCES "channel_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "idea_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_posts" ADD CONSTRAINT "scheduled_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_posts" ADD CONSTRAINT "scheduled_posts_user_channel_id_fkey" FOREIGN KEY ("user_channel_id") REFERENCES "user_channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
