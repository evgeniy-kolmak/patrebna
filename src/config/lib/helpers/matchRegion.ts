export function matchRegion(mainRegion: string, itemRegion: string): boolean {
  const base = mainRegion.replace(/ская$/i, '');
  return itemRegion.toLowerCase().includes(base.toLowerCase());
}
