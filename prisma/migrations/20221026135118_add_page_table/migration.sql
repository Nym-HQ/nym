/*
  Warnings:

  - You are about to drop the column `siteId` on the `PostEdit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `PostEdit` DROP COLUMN `siteId`;

-- CreateTable
CREATE TABLE `Page` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `publishedAt` DATETIME(3) NULL,
    `path` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(280) NOT NULL,
    `text` TEXT NOT NULL,
    `excerpt` VARCHAR(280) NOT NULL,
    `featureImage` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `siteId` VARCHAR(191) NOT NULL,

    INDEX `Page_publishedAt_idx`(`publishedAt`),
    UNIQUE INDEX `Page_slug_siteId_key`(`slug`, `siteId`),
    UNIQUE INDEX `Page_path_siteId_key`(`path`, `siteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PageEdit` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `text` TEXT NOT NULL,
    `title` VARCHAR(280) NOT NULL,
    `excerpt` VARCHAR(280) NOT NULL,
    `featureImage` VARCHAR(191) NULL,
    `pageId` VARCHAR(191) NULL,
    `siteId` VARCHAR(191) NULL,

    INDEX `PageEdit_pageId_idx`(`pageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
