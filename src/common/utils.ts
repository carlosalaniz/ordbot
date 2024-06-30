import mempoolJS from "@mempool/mempool.js";
import { FeeOptions } from "@prisma/client";
import config from "../config";
import { exec } from 'child_process'
import { randomUUID } from 'crypto';
import { promisify } from 'util'
import logger from "./logger";
const execPromise = promisify(exec);

export const sleep = async (ms: number) =>
    await new Promise((resolve) => setInterval(() => resolve(1), ms))


export async function estimateCost(sizeBytes, opts: { feeOption?: FeeOptions, fee_option_number?: number }) {
    const { bitcoin: { fees } } = mempoolJS({
        hostname: 'localhost-umbrel:3006'
    });

    const feesRecommended = await fees.getFeesRecommended();
    let fee: number;
    if (opts.feeOption)
        switch (opts.feeOption) {
            case FeeOptions.ECONOMY:
                fee = feesRecommended["economyFee"] || feesRecommended.minimumFee
                break;
            case FeeOptions.FASTEST:
                fee = feesRecommended.fastestFee
                break;
            case FeeOptions.HALF_HOUR:
                fee = feesRecommended.halfHourFee
                break;
            case FeeOptions.HOUR:
                fee = feesRecommended.hourFee
                break;
            case FeeOptions.MINIMUM:
                fee = feesRecommended.minimumFee
                break;
        }
    else
        fee = opts.fee_option_number;

    const multiplier = Number.parseFloat(config.INSCRIPTION_FEE_MULTIPLIER)
    const serviceFee = config.SERVICE_FEE_SATS
    const inscriptionCost = Math.round(((fee * sizeBytes) / 2.8) * multiplier)
    const transferCost = Math.round(1200 * fee)
    return {
        feeSats: fee,
        serviceFee,
        inscriptionCost,
        transferCost,
        total: serviceFee + inscriptionCost + transferCost
    }
}


type deferredType<T> = {
    resolve: () => void;
    reject: (reason?: any) => void;
    promise: Promise<T>;
}

export const deferred = <T>(
    func: () => Promise<T>
) => {
    let resolve: () => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = () => res(func());
        reject = rej;
    });

    return {
        resolve,
        reject,
        promise,
    } as deferredType<T>;
}

export class CommandQueue {
    private queue:
        { [key: string]: deferredType<any> } = {};
    // private maxParallelCommands = 1;
    constructor(private maxParallelCommands) {
        this.runner()
    }
    private async runner() {
        while (true) {
            const queueSize = Object.keys(this.queue).length;
            if (Object.keys(this.queue).length === 0) {
                await sleep(500);
                continue;
            }
            logger.log("CommandQueue", queueSize)
            const parallelCommands =
                Object.entries(this.queue).slice(0, this.maxParallelCommands);

            for (const [_, queueItem] of parallelCommands) {
                queueItem.resolve();
            }
            const promises = parallelCommands.map(c => c[1].promise);
            await Promise.all(promises);
            for (const [queueKey, _] of parallelCommands) {
                delete this.queue[queueKey]
            }
        }
    }
    async execute(command: string): Promise<string> {
        logger.log(command);
        const id = randomUUID();
        this.queue[id] = deferred<any>(
            async () => {
                const { stdout, stderr } = await execPromise(command)
                return stdout;
            }
        );
        logger.log(`queue size: ${Object.keys(this.queue).length}`)
        const result = await this.queue[id].promise;
        logger.log(result);
        return result;
    }
}