export default {
  async wait(millis: number) {
    await new Promise((r) => setTimeout(() => r(1), millis));
  },
};
