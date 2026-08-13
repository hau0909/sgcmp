import { create } from "zustand";

const MAX_COMPARE = 4;

type CompareStore = {
  selectedIds: string[];
  toggleCompany: (id: string) => void;
  removeCompany: (id: string) => void;
  clearAll: () => void;
  isSelected: (id: string) => boolean;
};

export const useCompareStore = create<CompareStore>()((set, get) => ({
  selectedIds: [],

  toggleCompany: (id: string) => {
    const { selectedIds } = get();
    if (selectedIds.includes(id)) {
      set({ selectedIds: selectedIds.filter((i) => i !== id) });
    } else {
      if (selectedIds.length >= MAX_COMPARE) return; // silently ignore
      set({ selectedIds: [...selectedIds, id] });
    }
  },

  removeCompany: (id: string) => {
    set({ selectedIds: get().selectedIds.filter((i) => i !== id) });
  },

  clearAll: () => set({ selectedIds: [] }),

  isSelected: (id: string) => get().selectedIds.includes(id),
}));
