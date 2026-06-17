import React, { createContext, useContext } from 'react';

import { useAddMedicationForm } from './useAddMedicationForm';

type FormContextValue = ReturnType<typeof useAddMedicationForm>;

const FormContext = createContext<FormContextValue | null>(null);

interface ProviderProps {
  existingCourseId?: string;
  editMedicationId?: string;
  children: React.ReactNode;
}

export function AddMedicationFormProvider({
  existingCourseId,
  editMedicationId,
  children,
}: ProviderProps) {
  const form = useAddMedicationForm(existingCourseId, editMedicationId);
  return (
    <FormContext.Provider value={form}>{children}</FormContext.Provider>
  );
}

export function useFormContext(): FormContextValue {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error('useFormContext must be used within AddMedicationFormProvider');
  }
  return ctx;
}
