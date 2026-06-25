import {
  createMMKV,
  deleteMMKV,
  existsMMKV,
  type MMKV,
} from 'react-native-mmkv';

import { getOrCreateEncryptionKey } from '@/storage/encryptionKey';
import { STORAGE_KEYS } from '@/storage/keys';

const LEGACY_MMKV_ID = 'mmkv.default';
const ENCRYPTED_MMKV_ID = 'pick-a-pill-secure';

const APP_DATA_KEYS: readonly string[] = [
  STORAGE_KEYS.USER_PROFILE,
  STORAGE_KEYS.COURSES,
  STORAGE_KEYS.DOSE_RECORDS,
  STORAGE_KEYS.ONBOARDED,
];

let mmkv: MMKV | null = null;
let initializePromise: Promise<void> | null = null;
let dataRecoveryNeeded = false;

function legacyHasAppData(legacy: MMKV): boolean {
  return APP_DATA_KEYS.some(key => legacy.contains(key));
}

function copyLegacyValues(legacy: MMKV, encrypted: MMKV): void {
  for (const key of legacy.getAllKeys()) {
    if (key === STORAGE_KEYS.MIGRATED_TO_ENCRYPTED) {
      continue;
    }

    const stringValue = legacy.getString(key);
    if (stringValue !== undefined) {
      encrypted.set(key, stringValue);
      continue;
    }

    const numberValue = legacy.getNumber(key);
    if (numberValue !== undefined) {
      encrypted.set(key, numberValue);
      continue;
    }

    const booleanValue = legacy.getBoolean(key);
    if (booleanValue !== undefined) {
      encrypted.set(key, booleanValue);
    }
  }
}

function logMigrationResult(result: 'migrated' | 'skipped' | 'failed'): void {
  console.log(`[MMKV] Encryption migration: ${result}`);
}

async function runMigration(
  encryptionKey: string,
): Promise<'migrated' | 'skipped' | 'failed'> {
  const encrypted = createMMKV({
    id: ENCRYPTED_MMKV_ID,
    encryptionKey,
  });

  if (encrypted.getString(STORAGE_KEYS.MIGRATED_TO_ENCRYPTED) === 'true') {
    mmkv = encrypted;
    return 'skipped';
  }

  const legacy = createMMKV({ id: LEGACY_MMKV_ID });

  if (!legacyHasAppData(legacy)) {
    encrypted.set(STORAGE_KEYS.MIGRATED_TO_ENCRYPTED, 'true');
    mmkv = encrypted;
    return 'skipped';
  }

  try {
    copyLegacyValues(legacy, encrypted);

    const migratedOk = APP_DATA_KEYS.some(key => encrypted.contains(key));
    if (!migratedOk) {
      throw new Error('Migration verification failed: app data missing in encrypted store');
    }

    encrypted.set(STORAGE_KEYS.MIGRATED_TO_ENCRYPTED, 'true');
    legacy.clearAll();
    mmkv = encrypted;
    return 'migrated';
  } catch (error) {
    console.error('[MMKV] Encryption migration failed:', error);
    if (existsMMKV(ENCRYPTED_MMKV_ID)) {
      deleteMMKV(ENCRYPTED_MMKV_ID);
    }
    mmkv = legacy;
    return 'failed';
  }
}

export async function initializeMmkvStorage(): Promise<void> {
  if (mmkv !== null) {
    return;
  }

  if (initializePromise !== null) {
    return initializePromise;
  }

  initializePromise = (async () => {
    const encryptionKey = await getOrCreateEncryptionKey();
    const result = await runMigration(encryptionKey);
    logMigrationResult(result);
  })();

  return initializePromise;
}

function getMmkv(): MMKV {
  if (mmkv === null) {
    throw new Error(
      'MMKV storage is not initialized. Call initializeMmkvStorage() before accessing storage.',
    );
  }
  return mmkv;
}

export function getString(key: string): string | undefined {
  return getMmkv().getString(key);
}

export function setString(key: string, value: string): void {
  getMmkv().set(key, value);
}

export function isDataRecoveryNeeded(): boolean {
  if (dataRecoveryNeeded) {
    return true;
  }
  if (mmkv === null) {
    return false;
  }
  return mmkv.getString(STORAGE_KEYS.DATA_RECOVERY_NEEDED) === 'true';
}

export function markDataRecoveryNeeded(): void {
  dataRecoveryNeeded = true;
  if (mmkv !== null) {
    mmkv.set(STORAGE_KEYS.DATA_RECOVERY_NEEDED, 'true');
  }
}

export function clearDataRecoveryNeeded(): void {
  dataRecoveryNeeded = false;
  if (mmkv !== null) {
    mmkv.remove(STORAGE_KEYS.DATA_RECOVERY_NEEDED);
  }
}

export function getObject<T>(key: string): T | undefined {
  const raw = getMmkv().getString(key);
  if (raw === undefined) {
    return undefined;
  }
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`[MMKV] Failed to parse JSON for key "${key}":`, error);
    markDataRecoveryNeeded();
    return undefined;
  }
}

export function setObject<T>(key: string, value: T): void {
  getMmkv().set(key, JSON.stringify(value));
}

export function deleteKey(key: string): void {
  getMmkv().remove(key);
}
