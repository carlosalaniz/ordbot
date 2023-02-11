-- CreateTable
CREATE TABLE `Wallet` (
    `id` VARCHAR(191) NOT NULL,
    `receiving_address` VARCHAR(191) NOT NULL,
    `mnemonic` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Wallet_receiving_address_key`(`receiving_address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InscriptionQueueItem` (
    `id` VARCHAR(191) NOT NULL,
    `inscription_cost` INTEGER NOT NULL,
    `fee_sats` INTEGER NOT NULL,
    `state` ENUM('PENDING_PAYMENT', 'WAITING_INSCRIBED_CONFIRMATION', 'WAITING_PAYMENT_CONFIRMATION', 'PAYMENT_CONFIRMED', 'ERROR', 'INSCRIBED', 'SENT') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `file_path` VARCHAR(191) NOT NULL,
    `mime_type` VARCHAR(191) NOT NULL,
    `fee_option` ENUM('FASTEST', 'HALF_HOUR', 'HOUR', 'ECONOMY', 'MINIMUM') NOT NULL,
    `destination_address` VARCHAR(191) NOT NULL,
    `total_sat` INTEGER NOT NULL,
    `error` VARCHAR(191) NULL,
    `walletId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `InscriptionQueueItem_walletId_key`(`walletId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InscriptionQueueItem` ADD CONSTRAINT `InscriptionQueueItem_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `Wallet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
