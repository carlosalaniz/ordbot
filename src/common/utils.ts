import mempoolJS from "@mempool/mempool.js";
import { FeeOptions } from "@prisma/client";
import config from "../config";
export const sleep = async (ms: number) =>
    await new Promise((resolve) => setInterval(() => resolve(1), ms))


export async function estimateCost(sizeBytes, fee_option: FeeOptions) {
    const { bitcoin: { fees } } = mempoolJS({
        hostname: 'mempool.space'
    });

    const feesRecommended = await fees.getFeesRecommended();
    let fee: number;
    switch (fee_option) {
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