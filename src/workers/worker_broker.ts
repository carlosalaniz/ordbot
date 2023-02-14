import logger from "../common/logger"
import config from "../config"
import { CheckPaymentConfirmationWorker } from "./check_payment_confirmation_worker"
import { CheckPaymentPendingWorker } from "./check_pending_payment_worker"
import { InscribeStateConfirmationWorker } from "./inscribe_state_confirmation_worker"
import { InscribeWorker } from "./inscribe_worker"
import { SendInscriptionWorker } from "./send_inscriptions_worker"

export class WorkerBroker {
    checkPaymentConfirmationWorker = new CheckPaymentConfirmationWorker(config.prismaClient)
    inscribeWorker = new InscribeWorker(config.prismaClient)
    inscribeStateConfirmationWorker = new InscribeStateConfirmationWorker(config.prismaClient)
    sendInscriptionWorker = new SendInscriptionWorker(config.prismaClient)
    checkPaymentPendingWorker = new CheckPaymentPendingWorker(config.prismaClient)
    async start() {
        const workers = [
            this.checkPaymentConfirmationWorker.start(),
            // this.inscribeWorker.start(),
            // this.inscribeStateConfirmationWorker.start(),
            // this.sendInscriptionWorker.start(),
            this.checkPaymentPendingWorker.start()
        ]
        try {
            await Promise.all(workers)
        } catch (e) {
            logger.error(`Stopping all workers due to reason: ${e}`);
            process.exit(-1);
        }
    }
}
const workerBroker = new WorkerBroker()
workerBroker.start()