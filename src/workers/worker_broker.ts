import { CheckPaymentConfirmationWorker } from "./check_payment_confirmation_worker"
import { InscribeStateConfirmationWorker } from "./inscribe_state_confirmation_worker"
import { InscribeWorker } from "./inscribe_worker"

export class WorkerBroker {
    checkPaymentConfirmationWorker = new CheckPaymentConfirmationWorker()
    inscribeWorker = new InscribeWorker()
    inscribeStateConfirmationWorker = new InscribeStateConfirmationWorker()
    async start() {
        await Promise.allSettled([
            this.checkPaymentConfirmationWorker.start(),
            this.inscribeWorker.start(),
            this.inscribeStateConfirmationWorker.start(),
        ])
    }
}
const workerBroker = new WorkerBroker()
workerBroker.start()