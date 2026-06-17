export type RootStackParamList = {
  Onboarding: undefined;
  App: undefined;
  AddMedicationFlow: {
    existingCourseId?: string;
    editMedicationId?: string;
  };
  CourseDetail: { courseId: string };
  EditProfile: undefined;
};

export type TabParamList = {
  Home: undefined;
  Dashboard: undefined;
  Settings: undefined;
};

export type AddMedicationStackParamList = {
  StepOne: {
    existingCourseId?: string;
    editMedicationId?: string;
  };
  StepTwo: {
    existingCourseId?: string;
    editMedicationId?: string;
  };
};
