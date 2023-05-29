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
CREATE TABLE `SiteChatBot` (
    `id` VARCHAR(191) NOT NULL,
    `siteId` VARCHAR(191) NOT NULL,
    `openai_key` VARCHAR(255) NULL,
    `prompt_template` TEXT NOT NULL DEFAULT '',
    `free_quota` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `SiteChatBot_siteId_key`(`siteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
