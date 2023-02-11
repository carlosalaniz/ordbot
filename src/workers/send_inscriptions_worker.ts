import { InscriptionQueueItemState, PrismaClient } from "@prisma/client";
import { IntervalWorkerAbstract } from "./worker";
import { OrdWallet } from "../common/ord"
import logger from "../common/logger";
import config from "../config";

export class SendInscriptionWorker extends IntervalWorkerAbstract {
    intervalMs = config.SEND_INSCRIPTION_WORKER_INTERVAL_MS;
    inscriptionsMax = config.SEND_INSCRIPTION_WORKER_INSCRIPTIONS_MAX;

    constructor(private prismaClient = new PrismaClient()) {
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
                fee_sats: true,
                wallet: true,
                destination_address: true
            },
            take: this.inscriptionsMax,
            orderBy: {
                updated_at: "asc" // FIFO
            },
            where: {
                state: InscriptionQueueItemState.INSCRIBED
            }
        });

        logger.debug(`InscribeWorker: ${uuid} Job Processing ${recordsToInscribe.length} inscriptionQueueItems...`)
        for (const record of recordsToInscribe) {
            try {
                const ord = new OrdWallet(record.wallet.id)
                await ord.send(
                    record.destination_address,
                    record.fee_sats
                )
                await this.updateQueueItemStatus(record.id, InscriptionQueueItemState.SENT)
            } catch (e) {
                await this.updateQueueItemStatus(record.id, InscriptionQueueItemState.ERROR, e)
            }
        }
    }
}
