
import { randomUUID } from "crypto";
import logger from "../common/logger"
import { sleep } from "../common/utils"
export abstract class IntervalWorkerAbstract {
    abstract intervalMs: number
    abstract doWork(uuid: string): Promise<void>
    async start() {
        while (1) {
            try {
                const uuid = randomUUID();
                logger.debug(`Staring job`, uuid)
                await this.doWork(uuid);
                logger.debug("Done job", uuid)
                await sleep(this.intervalMs);
            } catch (e) {
                logger.error(e)
                this.stop(e)
            }
        }
    }
    stop(opt?: { error: string }) {
        if (opt)
            throw opt;
    }
}