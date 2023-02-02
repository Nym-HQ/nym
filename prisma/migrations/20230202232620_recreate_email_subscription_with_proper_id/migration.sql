-- AlterTable
ALTER TABLE `Page` MODIFY `text` TEXT NOT NULL DEFAULT '',
    MODIFY `data` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `PageEdit` MODIFY `text` TEXT NOT NULL DEFAULT '',
    MODIFY `data` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `Post` MODIFY `text` TEXT NOT NULL DEFAULT '',
    MODIFY `data` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `PostEdit` MODIFY `text` TEXT NOT NULL DEFAULT '',
    MODIFY `data` TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE `EmailSubscription` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `type` ENUM('NEWSLETTER') NOT NULL,
    `userId` VARCHAR(191) NULL,
    `siteId` VARCHAR(191) NOT NULL,

    INDEX `EmailSubscription_email_idx`(`email`),
    UNIQUE INDEX `EmailSubscription_email_type_siteId_key`(`email`, `type`, `siteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
