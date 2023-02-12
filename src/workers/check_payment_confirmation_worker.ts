import config from "../config";
import { IntervalWorkerAbstract } from "./worker";
import { InscriptionQueueItemState, PrismaClient } from '@prisma/client'
import mempoolJS from "@mempool/mempool.js";
import { AddressInstance } from "@mempool/mempool.js/lib/interfaces/bitcoin/addresses";
import logger from "../common/logger";

export class CheckPaymentConfirmationWorker extends IntervalWorkerAbstract {
    private addressesApi: AddressInstance;
    constructor(private prismaClient: PrismaClient) {
        super()
        const { bitcoin: { addresses } } = mempoolJS({
            hostname: 'mempool.space'
        });
        this.addressesApi = addresses;
    }
    intervalMs = config.PAYMENT_CONFIRMATION_WORKER_INTERVAL_MS; // 30 seconds in ms
    maxRecords = config.PAYMENT_CONFIRMATION_WORKER_MAX_RECORDS;

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
                state: InscriptionQueueItemState.WAITING_PAYMENT_CONFIRMATION
            }
        });
        logger.debug(`CheckPaymentConfirmationWorker: ${uuid} JobProcessing ${recordsToCheck.length} inscriptionQueueItems...`)
        for (const record of recordsToCheck) {
            const walletCheck = await this.addressesApi.getAddressTxs({
                address: record.wallet.receiving_address
            });

            // we assume a newly created wallet.
            // thus this wallet should only have 1 txn at this point in time (Waiting for funds)
            if (walletCheck.length > 1) {
                const error = `wallet ${record.wallet.id} is in an illegal state. more than one funding txn`;
                await this.updateQueueItemStatus(record.id, InscriptionQueueItemState.ERROR, error)
                logger.error(error);
                continue;
            }
            const txn = walletCheck.at(0);
            const confirmed = txn.status.confirmed;
            const total = txn.vin.reduce((total, currentVin) => total + currentVin.prevout.value, 0);
            if (confirmed) {
                if (total !== record.total_sat) {
                    const error = `txn ${txn.txid} has an incorrect total amount. txn total amount ${total} but ${record.total_sat} expected`;
                    await this.updateQueueItemStatus(record.id, InscriptionQueueItemState.ERROR, error)
                    logger.error(error);
                    continue;
                }
                await this.updateQueueItemStatus(record.id, InscriptionQueueItemState.PAYMENT_CONFIRMED)
            }
        }
    }
}