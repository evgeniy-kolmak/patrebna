export const truncateString = (s: string, l: number): string => {
  return s.length > l ? `${s.substring(0, l)} ...` : s;
};
