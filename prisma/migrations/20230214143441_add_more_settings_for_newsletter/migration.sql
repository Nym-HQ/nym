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

-- AlterTable
ALTER TABLE `Site` ADD COLUMN `newsletter_description` VARCHAR(255) NULL,
    ADD COLUMN `newsletter_double_optin` BOOLEAN NULL DEFAULT true;
