import * as Keychain from 'react-native-keychain';
import uuid from 'react-native-uuid';

const KEYCHAIN_SERVICE = 'PickAPill.MMKVEncryptionKey';
const KEY_BYTE_LENGTH = 16;

function generateEncryptionKey(): string {
  const raw = String(uuid.v4()).replace(/-/g, '');
  return raw.slice(0, KEY_BYTE_LENGTH);
}

export async function getOrCreateEncryptionKey(): Promise<string> {
  const existing = await Keychain.getGenericPassword({
    service: KEYCHAIN_SERVICE,
  });

  if (existing !== false && existing.password.length > 0) {
    return existing.password;
  }

  const key = generateEncryptionKey();
  const stored = await Keychain.setGenericPassword('mmkv-key', key, {
    service: KEYCHAIN_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });

  if (stored === false) {
    throw new Error('Failed to persist MMKV encryption key to Keychain');
  }

  return key;
}
