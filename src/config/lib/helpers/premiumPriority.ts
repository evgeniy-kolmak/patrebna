import { StatusPremium } from 'config/types';

export const PREMIUM_PRIORITY: Record<StatusPremium, number> = {
  [StatusPremium.NONE]: 0,
  [StatusPremium.EXPIRED]: 0,
  [StatusPremium.FREE]: 1,
  [StatusPremium.BASE]: 2,
  [StatusPremium.MAIN]: 3,
};

export function hasHigherActiveStatus(
  currentStatus: StatusPremium | undefined,
  currentEndDate: Date | null | undefined,
  targetStatus: StatusPremium,
): boolean {
  if (!currentStatus || !currentEndDate) return false;
  if (new Date(currentEndDate) <= new Date()) return false;

  return PREMIUM_PRIORITY[currentStatus] > PREMIUM_PRIORITY[targetStatus];
}
