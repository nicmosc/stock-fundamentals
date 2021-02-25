export async function timeout(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
