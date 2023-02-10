export const sleep = async (ms: number) =>
    await new Promise((resolve) => setInterval(() => resolve(1), ms))


