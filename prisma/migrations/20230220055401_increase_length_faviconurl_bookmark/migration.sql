-- AlterTable
ALTER TABLE `Bookmark` MODIFY `faviconUrl` VARCHAR(512) NULL;

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