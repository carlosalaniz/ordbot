

// import { exec } from 'child_process'
// import { randomUUID } from 'crypto';
// import { promisify } from 'util'
// import { sleep } from './common/utils';
// const execPromise = promisify(exec);

// type deferredType<T> = {
//     resolve: () => void;
//     reject: (reason?: any) => void;
//     promise: Promise<T>;
// }

// export const deferred = <T>(
//     func: () => Promise<T>
// ) => {
//     let resolve: () => void;
//     let reject!: (reason?: any) => void;
//     const promise = new Promise<T>((res, rej) => {
//         resolve = () => res(func());
//         reject = rej;
//     });

//     return {
//         resolve,
//         reject,
//         promise,
//     } as deferredType<T>;
// }

// export class commandQueue {
//     private queue:
//         { [key: string]: deferredType<any> } = {};
//     constructor(private maxParallelCommands) {
//         this.runner()
//     }
//     private async runner() {
//         while (true) {
//             console.log(Object.keys(this.queue).length)
//             if (Object.keys(this.queue).length === 0)
//                 await sleep(5000);
//             const parallelCommands =
//                 Object.entries(this.queue).slice(0, this.maxParallelCommands);

//             for (const [_, queueItem] of parallelCommands) {
//                 queueItem.resolve();
//             }
//             const promises = parallelCommands.map(c => c[1].promise);
//             await Promise.all(promises);
//             for (const [queueKey, _] of parallelCommands) {
//                 delete this.queue[queueKey]
//             }
//         }
//     }
//     async execute(command: string) {
//         const id = randomUUID();
//         this.queue[id] = deferred<any>(
//             async () => {
//                 const { stdout, stderr } = await execPromise(command)
//                 return stdout;
//             }
//         );
//         console.log(`queue size: ${Object.keys(this.queue).length}`)
//         const result = await this.queue[id].promise;
//         console.log(result);
//         return result;
//     }
// }


// const queue = new commandQueue();

// const promiseArray = []
// for (let i = 0; i < 50; i++) {
//     promiseArray.push(
//         queue.execute(
//             `ord --wallet wallet_${i} wallet create`
//         )
//     )
// }
// (async () => {
//     await Promise.all(promiseArray);
//     console.log("done")
// })()


import { RPCClient } from "rpc-bitcoin"

const client = new RPCClient({
    url: 'http://localhost',
    port: 8332,
    user: "user",
    pass: "qhi5h4po",
    // wallet: 'donpepe/wallet.dat',
});

(async () => {
    try {

        const info = await client.getblockchaininfo();
        console.log(info)
        // //
        // const walletFile = "/home/user/.bitcoin/wallets/donpepe";
        // const minconf = 6;
        // const include_watchonly = true;
        // var result = await client.loadwallet({ filename: walletFile });
        // console.log(result)
        // result = await client.getbalance({ minconf, include_watchonly }, walletFile);
        // console.log(result)

        const i = await client
            .getaddressinfo(
                { address: "bc1ptgzstfqspehrstaxe86yamyzseu5t0f93c8xm7jl6ur8h38w558qtpy7d4" }
            )
        console.log(i)
    } catch (e) {
        console.log(e);
    }
})()