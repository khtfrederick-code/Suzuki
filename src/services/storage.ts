export function readStorage<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeStorage(storage: Storage, key: string, value: unknown) {
  storage.setItem(key, JSON.stringify(value));
}

export function removeStorage(storage: Storage, key: string) {
  storage.removeItem(key);
}

export function previewDelay(ms = 180) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
