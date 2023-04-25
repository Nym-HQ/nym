/*
  Warnings:

  - A unique constraint covering the columns `[url,siteId]` on the table `Bookmark` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Bookmark_url_key` ON `Bookmark`;

-- AlterTable
ALTER TABLE `Bookmark` MODIFY `url` VARCHAR(512) NOT NULL;

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

-- CreateIndex
CREATE UNIQUE INDEX `Bookmark_url_siteId_key` ON `Bookmark`(`url`, `siteId`);
