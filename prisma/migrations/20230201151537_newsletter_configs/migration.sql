/*
  Warnings:

  - You are about to drop the column `mailgun_api_key` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `mailgun_domain` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `mailgun_region` on the `Site` table. All the data in the column will be lost.

*/
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
ALTER TABLE `Site` DROP COLUMN `mailgun_api_key`,
    DROP COLUMN `mailgun_domain`,
    DROP COLUMN `mailgun_region`,
    ADD COLUMN `newsletter_provder` VARCHAR(30) NULL,
    ADD COLUMN `newsletter_setting1` VARCHAR(255) NULL,
    ADD COLUMN `newsletter_setting2` VARCHAR(255) NULL,
    ADD COLUMN `newsletter_setting3` VARCHAR(255) NULL;
