import { useCourseStore } from '@/stores/useCourseStore';
import { useDoseStore } from '@/stores/useDoseStore';
import { useProfileStore } from '@/stores/useProfileStore';

export function hydrateAllStores(): void {
  useProfileStore.getState().hydrateFromStorage();
  useCourseStore.getState().hydrateFromStorage();
  useDoseStore.getState().hydrateFromStorage();
}
