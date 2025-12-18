import { create } from 'zustand';

interface NavigationState {
  activeTab: string;
  setActiveTab: (_tab: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeTab: 'timeline',
  setActiveTab: (_tab: string) => set({ activeTab: _tab }),
}));