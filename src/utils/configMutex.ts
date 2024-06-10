let configUpdateLock = false;

export function acquireLock() {
  configUpdateLock = true;
}

export function releaseLock() {
  configUpdateLock = false;
}

export function isLockAcquired() {
  return configUpdateLock;
}
