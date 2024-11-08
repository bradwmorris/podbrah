// store/formStore.ts
import { create } from 'zustand';

interface FormState {
  step: number;
  podcastGoal: string;
  selectedThemes: string[];
  themeUnderstanding: number;
  name: string;
  email: string;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  updateFormData: (data: Partial<FormState>) => void;
}

const useFormStore = create<FormState>()((set) => ({
  step: 1,
  podcastGoal: '',
  selectedThemes: [],
  themeUnderstanding: 3,
  name: '',
  email: '',
  goToNextStep: () => set((state) => ({ step: state.step + 1 })),
  goToPreviousStep: () => set((state) => ({ step: state.step - 1 })),
  updateFormData: (data) => set((state) => ({ ...state, ...data })),
}));

export default useFormStore;