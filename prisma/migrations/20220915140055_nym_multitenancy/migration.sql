/*
  Warnings:

  - You are about to drop the column `nickname` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email,type,siteId]` on the table `EmailSubscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,siteId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,siteId]` on the table `Stack` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,siteId]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `siteId` to the `Audio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteId` to the `Bookmark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteId` to the `EmailSubscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteId` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteId` to the `PostEdit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteId` to the `Reaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteId` to the `Stack` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteId` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `EmailSubscription_email_type_key` ON `EmailSubscription`;

-- DropIndex
DROP INDEX `Post_slug_key` ON `Post`;

-- DropIndex
DROP INDEX `Stack_slug_key` ON `Stack`;

-- DropIndex
DROP INDEX `Tag_name_key` ON `Tag`;

-- AlterTable
ALTER TABLE `Audio` ADD COLUMN `siteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Bookmark` ADD COLUMN `siteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Comment` ADD COLUMN `siteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `EmailSubscription` ADD COLUMN `siteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Post` ADD COLUMN `siteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `PostEdit` ADD COLUMN `siteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Question` ADD COLUMN `siteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Reaction` ADD COLUMN `siteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Stack` ADD COLUMN `siteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Tag` ADD COLUMN `siteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `nickname`;

-- CreateTable
CREATE TABLE `Site` (
    `id` VARCHAR(191) NOT NULL,
    `subdomain` VARCHAR(128) NOT NULL,
    `parkedDomain` VARCHAR(255) NOT NULL,
    `plan` ENUM('FREE', 'BASIC') NOT NULL DEFAULT 'FREE',

    UNIQUE INDEX `Site_subdomain_key`(`subdomain`),
    UNIQUE INDEX `Site_parkedDomain_key`(`parkedDomain`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserSite` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `siteId` VARCHAR(191) NOT NULL,
    `siteRole` ENUM('BLOCKED', 'USER', 'ADMIN', 'OWNER') NOT NULL DEFAULT 'USER',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `EmailSubscription_email_type_siteId_key` ON `EmailSubscription`(`email`, `type`, `siteId`);

-- CreateIndex
CREATE UNIQUE INDEX `Post_slug_siteId_key` ON `Post`(`slug`, `siteId`);

-- CreateIndex
CREATE UNIQUE INDEX `Stack_slug_siteId_key` ON `Stack`(`slug`, `siteId`);

-- CreateIndex
CREATE UNIQUE INDEX `Tag_name_siteId_key` ON `Tag`(`name`, `siteId`);
