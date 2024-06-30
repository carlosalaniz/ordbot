import config from "../config";
import { IntervalWorkerAbstract } from "./worker";
import { InscriptionQueueItemState, PrismaClient } from '@prisma/client'
import mempoolJS from "@mempool/mempool.js";
import { AddressInstance } from "@mempool/mempool.js/lib/interfaces/bitcoin/addresses";
import logger from "../common/logger";
import { OrdWallet } from "../common/ord";

export class InscribeStateConfirmationWorker extends IntervalWorkerAbstract {
    private addressesApi: AddressInstance;
    constructor(private prismaClient: PrismaClient) {
        super()
        const { bitcoin: { addresses } } = mempoolJS({
            hostname: 'localhost-umbrel:3006'
        });
        this.addressesApi = addresses;
    }
    intervalMs = config.INSCRIBE_STATE_CONFIRMATION_INTERVAL_MS;
    maxRecords = config.INSCRIBE_STATE_CONFIRMATION_MAX_RECORDS;

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
                updated_at: true,
                wallet: true,
                walletId: true,
            },
            take: this.maxRecords,
            orderBy: {
                created_at: "asc"
            },
            where: {
                state: InscriptionQueueItemState.WAITING_INSCRIBED_CONFIRMATION
            }
        });
        logger.debug(`InscribeStateConfirmationWorker: ${uuid} JobProcessing ${recordsToCheck.length} inscriptionQueueItems...`)
        for (const record of recordsToCheck) {
            // we assume a newly created wallet.
            // thus this wallet should only have 2 txns one funding transactions and one inscribing txn
            const ord = new OrdWallet(record.wallet.id)
            const transactions = await ord.transactions();
            if (typeof transactions === "string") {
                await this.updateQueueItemStatus(record.id, InscriptionQueueItemState.ERROR, transactions)
            } else {
                const confirmed = transactions.every(t => t.confirmations > 0)
                if (confirmed) {
                    await this.updateQueueItemStatus(record.id, InscriptionQueueItemState.INSCRIBED);
                }
            }
        }
    }
}