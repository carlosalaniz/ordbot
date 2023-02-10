/*
  Warnings:

  - Added the required column `destination_address` to the `InscriptionQueueItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fee_option` to the `InscriptionQueueItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_sat` to the `InscriptionQueueItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `inscriptionqueueitem` ADD COLUMN `destination_address` VARCHAR(191) NOT NULL,
    ADD COLUMN `fee_option` ENUM('FASTEST', 'HALF_HOUR', 'HOUR', 'ECONOMY', 'MINIMUM') NOT NULL,
    ADD COLUMN `total_sat` INTEGER NOT NULL;
