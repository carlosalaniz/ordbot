import mempoolJS from "@mempool/mempool.js";
import logger from "../common/logger";
(async () => {
    const { bitcoin: { addresses } } = mempoolJS({
        hostname: 'mempool.space'
    });
    const addressesApi = addresses;
    const walletCheck = await addressesApi.getAddress({
        address: 'bc1pz5y56mzzwacc9jldwvngme4cw8vx8sgq5xl02ju7tjfk3jhjspcqt8gj67'
    });
                    //debits - credits
    const balance = walletCheck.chain_stats.funded_txo_sum - walletCheck.chain_stats.spent_txo_sum
    logger.log(balance);
})()