/*
  Warnings:

  - You are about to drop the `Stack` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StackToTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StackToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `data` to the `Page` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Page` ADD COLUMN `data` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Post` ADD COLUMN `data` TEXT NOT NULL;

-- DropTable
DROP TABLE `Stack`;

-- DropTable
DROP TABLE `_StackToTag`;

-- DropTable
DROP TABLE `_StackToUser`;
