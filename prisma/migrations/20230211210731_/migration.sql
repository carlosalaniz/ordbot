/*
  Warnings:

  - Added the required column `expires_in` to the `InscriptionQueueItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `InscriptionQueueItem` ADD COLUMN `expires_in` DATETIME(3) NOT NULL;
