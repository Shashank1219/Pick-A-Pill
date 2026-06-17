import { createMMKV } from 'react-native-mmkv';

const mmkv = createMMKV();

export function getString(key: string): string | undefined {
  return mmkv.getString(key);
}

export function setString(key: string, value: string): void {
  mmkv.set(key, value);
}

export function getObject<T>(key: string): T | undefined {
  const raw = mmkv.getString(key);
  if (raw === undefined) {
    return undefined;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export function setObject<T>(key: string, value: T): void {
  mmkv.set(key, JSON.stringify(value));
}

export function deleteKey(key: string): void {
  mmkv.remove(key);
}
