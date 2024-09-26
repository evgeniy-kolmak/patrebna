export function compareCollections(
  srcIds: string[],
  parseIds: string[],
): string[] {
  return parseIds.filter((id) => !srcIds.includes(id));
}
