import config from "../config";
import { IntervalWorkerAbstract } from "./worker";
import { InscriptionQueueItemState, PrismaClient } from '@prisma/client'
import mempoolJS from "@mempool/mempool.js";
import { AddressInstance } from "@mempool/mempool.js/lib/interfaces/bitcoin/addresses";
import logger from "../common/logger";

export class CheckPaymentPendingWorker extends IntervalWorkerAbstract {
    private addressesApi: AddressInstance;
    constructor(private prismaClient: PrismaClient) {
        super()
        const { bitcoin: { addresses } } = mempoolJS({
            hostname: 'localhost-umbrel:3006'
        });
        this.addressesApi = addresses;
    }
    intervalMs = config.PAYMENT_PENDING_WORKER_INTERVAL_MS; // 30 seconds in ms
    maxRecords = config.PAYMENT_PENDING_WORKER_MAX_RECORDS;

    private async updateQueueItemStatus(id: string, state: InscriptionQueueItemState, error?: string) {
        await this.prismaClient.inscriptionQueueItem.update(
            {
                where: { id },
                data: { error, state, updated_at: new Date() }
            },
        )
    }

    async doWork(uuid: string): Promise<void> {
        const recordsToCheck = await this.prismaClient.inscriptionQueueItem.findMany({
            select: {
                id: true,
                created_at: true,
                wallet: true,
                walletId: true,
                state: true,
                total_sat: true
            },
            take: this.maxRecords,
            orderBy: {
                created_at: "asc" // FIFO
            },
            where: {
                state: InscriptionQueueItemState.PENDING_PAYMENT
            }
        });
        
        logger.debug(`CheckPaymentConfirmationWorker: ${uuid} JobProcessing ${recordsToCheck.length} inscriptionQueueItems...`)
        for (const record of recordsToCheck) {
            const walletInfo = await this.addressesApi.getAddress({
                address: record.wallet.receiving_address
            });
            if (walletInfo.mempool_stats.tx_count === 0) continue
            await this.updateQueueItemStatus(record.id, InscriptionQueueItemState.WAITING_PAYMENT_CONFIRMATION);
        }
    }
}