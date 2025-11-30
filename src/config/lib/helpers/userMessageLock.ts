import { Mutex } from 'async-mutex';

const userLocks = new Map<number, Mutex>();

export function getUserLock(userId: number): Mutex {
  let lock = userLocks.get(userId);
  if (!lock) {
    lock = new Mutex();
    userLocks.set(userId, lock);
  }
  return lock;
}
