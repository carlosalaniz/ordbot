import config from "../config";
import { IntervalWorkerAbstract } from "./worker";
import { InscriptionQueueItemState, PrismaClient } from '@prisma/client'
import mempoolJS from "@mempool/mempool.js";
import { AddressInstance } from "@mempool/mempool.js/lib/interfaces/bitcoin/addresses";
import logger from "../common/logger";

export class InscribeStateConfirmationWorker extends IntervalWorkerAbstract {
    private addressesApi: AddressInstance;
    constructor(private prismaClient: PrismaClient) {
        super()
        const { bitcoin: { addresses } } = mempoolJS({
            hostname: 'mempool.space'
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
            const walletTXNs = await this.addressesApi.getAddressTxs({
                address: record.wallet.receiving_address
            });

            // we assume a newly created wallet.
            // thus this wallet should only have 2 txns one funding transactions and one inscribing txn
            const confirmed = walletTXNs.every(txn => txn.status.confirmed);
            if (confirmed) {
                await this.updateQueueItemStatus(record.id, InscriptionQueueItemState.INSCRIBED);
            }
        }
    }
}