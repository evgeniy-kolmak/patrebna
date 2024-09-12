export async function pause(val = 500): Promise<unknown> {
  return await new Promise((resolve) => {
    setTimeout(resolve, val);
  });
}
