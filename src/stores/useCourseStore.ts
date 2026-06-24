import { create } from 'zustand';

import { computeCourseStatus } from '@/utils/courseHelpers';
import { getObject, setObject } from '@/storage/mmkvStorage';
import { STORAGE_KEYS } from '@/storage/keys';
import { Course, Medication } from '@/types';

interface CourseStore {
  courses: Course[];
  addCourse: (course: Course) => void;
  updateCourse: (id: string, partial: Partial<Course>) => void;
  addMedicationToCourse: (courseId: string, medication: Medication) => void;
  addMedicationsToCourse: (courseId: string, medications: Medication[]) => void;
  updateMedicationInCourse: (
    courseId: string,
    medicationId: string,
    partial: Partial<Medication>,
  ) => void;
  deleteCourse: (id: string) => void;
  getCourseById: (id: string) => Course | undefined;
  getActiveCourses: () => Course[];
  getCompletedCourses: () => Course[];
}

const hydrateCourses = (): Course[] => {
  return getObject<Course[]>(STORAGE_KEYS.COURSES) ?? [];
};

export const useCourseStore = create<CourseStore>((set, get) => ({
  courses: hydrateCourses(),

  addCourse: (course: Course) => {
    const courses = [...get().courses, course];
    setObject(STORAGE_KEYS.COURSES, courses);
    set({ courses });
  },

  updateCourse: (id: string, partial: Partial<Course>) => {
    const courses = get().courses.map(c =>
      c.id === id ? { ...c, ...partial } : c,
    );
    setObject(STORAGE_KEYS.COURSES, courses);
    set({ courses });
  },

  addMedicationToCourse: (courseId: string, medication: Medication) => {
    const courses = get().courses.map(c =>
      c.id === courseId
        ? { ...c, medications: [...c.medications, medication] }
        : c,
    );
    setObject(STORAGE_KEYS.COURSES, courses);
    set({ courses });
  },

  addMedicationsToCourse: (courseId: string, medications: Medication[]) => {
    const courses = get().courses.map(c =>
      c.id === courseId
        ? { ...c, medications: [...c.medications, ...medications] }
        : c,
    );
    setObject(STORAGE_KEYS.COURSES, courses);
    set({ courses });
  },

  updateMedicationInCourse: (
    courseId: string,
    medicationId: string,
    partial: Partial<Medication>,
  ) => {
    const courses = get().courses.map(c => {
      if (c.id !== courseId) {
        return c;
      }
      return {
        ...c,
        medications: c.medications.map(m =>
          m.id === medicationId ? { ...m, ...partial } : m,
        ),
      };
    });
    setObject(STORAGE_KEYS.COURSES, courses);
    set({ courses });
  },

  deleteCourse: (id: string) => {
    const courses = get().courses.filter(c => c.id !== id);
    setObject(STORAGE_KEYS.COURSES, courses);
    set({ courses });
  },

  getCourseById: (id: string) => {
    return get().courses.find(c => c.id === id);
  },

  getActiveCourses: () => {
    return get().courses.filter(c => computeCourseStatus(c).isActive);
  },

  getCompletedCourses: () => {
    return get().courses.filter(c => computeCourseStatus(c).isCompleted);
  },
}));
