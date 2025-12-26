export function getSecondsUntilEndOfDay(): number {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const ttlMs = end.getTime() - now.getTime();
  return Math.ceil(ttlMs / 1000);
}
