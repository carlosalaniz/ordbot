/*
  Warnings:

  - You are about to drop the column `file_bytes` on the `inscriptionqueueitem` table. All the data in the column will be lost.
  - Added the required column `file_path` to the `InscriptionQueueItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `inscriptionqueueitem` DROP COLUMN `file_bytes`,
    ADD COLUMN `file_path` VARCHAR(191) NOT NULL;
