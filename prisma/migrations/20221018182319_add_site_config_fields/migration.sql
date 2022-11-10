-- AlterTable
ALTER TABLE `Site` ADD COLUMN `attach_css` TEXT NULL,
    ADD COLUMN `attach_js` TEXT NULL,
    ADD COLUMN `banner` TEXT NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `logo` TEXT NULL,
    ADD COLUMN `mailgun_api_key` VARCHAR(255) NULL,
    ADD COLUMN `mailgun_domain` VARCHAR(255) NULL,
    ADD COLUMN `mailgun_region` VARCHAR(2) NULL,
    ADD COLUMN `name` VARCHAR(255) NULL,
    ADD COLUMN `social_github` TEXT NULL,
    ADD COLUMN `social_twitter` TEXT NULL,
    ADD COLUMN `social_youtube` TEXT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `social_github` TEXT NULL,
    ADD COLUMN `social_twitter` TEXT NULL,
    ADD COLUMN `social_youtube` TEXT NULL;
