import { InscriptionQueueItemState, PrismaClient } from "@prisma/client";
import { IntervalWorkerAbstract } from "./worker";
import { OrdWallet } from "../common/ord"
import logger from "../common/logger";
import config from "../config";

export class InscribeWorker extends IntervalWorkerAbstract {
    intervalMs = config.INSCRIBE_WORKER_INTERVAL_MS;
    inscriptionsMax = config.INSCRIBE_WORKER_INSCRIPTIONS_MAX;

    constructor(private prismaClient: PrismaClient) {
        super()
    }

    private async updateQueueItemStatus(id: string, state: InscriptionQueueItemState, error?: string) {
        await this.prismaClient.inscriptionQueueItem.update(
            {
                where: { id },
                data: { error, state, updated_at: new Date() }
            },
        )
    }

    async doWork(uuid: string): Promise<void> {
        const recordsToInscribe = await this.prismaClient.inscriptionQueueItem.findMany({
            select: {
                id: true,
                file_path: true,
                mime_type: true,
                fee_sats: true,
                wallet: true,
            },
            take: this.inscriptionsMax,
            orderBy: {
                updated_at: "asc" // FIFO
            },
            where: {
                state: InscriptionQueueItemState.PAYMENT_CONFIRMED
            }
        });

        logger.debug(`InscribeWorker: ${uuid} Job Processing ${recordsToInscribe.length} inscriptionQueueItems...`)
        for (const record of recordsToInscribe) {
            try {
                const ord = new OrdWallet(record.wallet.id)
                await ord.inscribe(
                    record.file_path,
                    record.fee_sats
                )
                await this.updateQueueItemStatus(record.id, InscriptionQueueItemState.WAITING_INSCRIBED_CONFIRMATION)
            } catch (e) {
                await this.updateQueueItemStatus(record.id, InscriptionQueueItemState.ERROR, e)
            }
        }
    }
}
