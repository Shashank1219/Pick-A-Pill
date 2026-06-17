import { create } from 'zustand';

import { getObject, setObject } from '@/storage/mmkvStorage';
import { STORAGE_KEYS } from '@/storage/keys';
import { UserProfile } from '@/types';

interface ProfileStore {
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
}

const hydrateProfile = (): UserProfile | null => {
  return getObject<UserProfile>(STORAGE_KEYS.USER_PROFILE) ?? null;
};

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: hydrateProfile(),

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
