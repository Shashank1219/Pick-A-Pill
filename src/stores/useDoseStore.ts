import { create } from 'zustand';
import uuid from 'react-native-uuid';

import { getObject, setObject } from '@/storage/mmkvStorage';
import { STORAGE_KEYS } from '@/storage/keys';
import { DoseRecord, DoseStatus } from '@/types';

interface DoseStore {
  records: DoseRecord[];
  getDoseForDay: (
    medicationId: string,
    date: string,
  ) => DoseRecord | undefined;
  markDose: (
    courseId: string,
    medicationId: string,
    date: string,
    status: DoseStatus,
  ) => void;
  getRecordsForDate: (date: string) => DoseRecord[];
  getRecordsInRange: (fromDate: string, toDate: string) => DoseRecord[];
  deleteRecordsForCourse: (courseId: string) => void;
}

const hydrateRecords = (): DoseRecord[] => {
  return getObject<DoseRecord[]>(STORAGE_KEYS.DOSE_RECORDS) ?? [];
};

export const useDoseStore = create<DoseStore>((set, get) => ({
  records: hydrateRecords(),

  getDoseForDay: (medicationId: string, date: string) => {
    return get().records.find(
      r => r.medicationId === medicationId && r.date === date,
    );
  },

  markDose: (
    courseId: string,
    medicationId: string,
    date: string,
    status: DoseStatus,
  ) => {
    const existing = get().records.find(
      r => r.medicationId === medicationId && r.date === date,
    );

    let records: DoseRecord[];
    if (existing) {
      records = get().records.map(r =>
        r.id === existing.id
          ? { ...r, status, markedAt: new Date().toISOString() }
          : r,
      );
    } else {
      const newRecord: DoseRecord = {
        id: uuid.v4() as string,
        courseId,
        medicationId,
        date,
        status,
        markedAt: new Date().toISOString(),
      };
      records = [...get().records, newRecord];
    }

    setObject(STORAGE_KEYS.DOSE_RECORDS, records);
    set({ records });
  },

  getRecordsForDate: (date: string) => {
    return get().records.filter(r => r.date === date);
  },

  getRecordsInRange: (fromDate: string, toDate: string) => {
    return get().records.filter(r => r.date >= fromDate && r.date <= toDate);
  },

  deleteRecordsForCourse: (courseId: string) => {
    const records = get().records.filter(r => r.courseId !== courseId);
    setObject(STORAGE_KEYS.DOSE_RECORDS, records);
    set({ records });
  },
}));
