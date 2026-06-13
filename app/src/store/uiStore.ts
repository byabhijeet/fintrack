import { create } from 'zustand';

interface UIState {
  privacyMode: boolean;
  togglePrivacyMode: () => void;
  boiOpen: boolean;
  openBOI: () => void;
  closeBOI: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  privacyMode: false,
  togglePrivacyMode: () => set((state) => ({ privacyMode: !state.privacyMode })),
  boiOpen: false,
  openBOI: () => set({ boiOpen: true }),
  closeBOI: () => set({ boiOpen: false }),
}));
