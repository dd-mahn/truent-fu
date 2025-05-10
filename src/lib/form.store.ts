import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FormData {
  motThoi: string;
  thoiHanDaXa: string;
  school: string;
  class: string;
  name: string;
  essayContentTop: string;
  essayContentBottom: string;
  ngayThangNam: string;
}

interface FormStore {
  formData: FormData | null;
  setFormData: (data: FormData) => void;
  clearFormData: () => void;
}

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      formData: null,
      setFormData: (data) => set({ formData: data }),
      clearFormData: () => set({ formData: null }),
    }),
    {
      name: 'form-storage',
    }
  )
);
