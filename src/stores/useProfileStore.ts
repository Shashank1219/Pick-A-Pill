import { create } from 'zustand';

import { getObject, setObject } from '@/storage/mmkvStorage';
import { STORAGE_KEYS } from '@/storage/keys';
import { UserProfile } from '@/types';

const hydrateProfile = (): UserProfile | null => {
  try {
    return getObject<UserProfile>(STORAGE_KEYS.USER_PROFILE) ?? null;
  } catch {
    return null;
  }
};

interface ProfileStore {
  profile: UserProfile | null;
  hydrateFromStorage: () => void;
  setProfile: (p: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,

  hydrateFromStorage: () => {
    set({ profile: hydrateProfile() });
  },

  setProfile: (p: UserProfile) => {
    setObject(STORAGE_KEYS.USER_PROFILE, p);
    set({ profile: p });
  },

  updateProfile: (partial: Partial<UserProfile>) => {
    const current = get().profile;
    if (!current) {
      return;
    }
    const updated = { ...current, ...partial };
    setObject(STORAGE_KEYS.USER_PROFILE, updated);
    set({ profile: updated });
  },
}));
