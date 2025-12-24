import { create } from 'zustand';
import { dynastiesStorage, StorageListener, STORAGE_KEYS } from '@/utils/storage';

interface DynastiesState {
  expandedStates: Record<string, boolean>;
  dynastyIds: string[];
  isDynastyExpanded: (dynastyId: string) => boolean;
  setDynastyExpanded: (dynastyId: string, expanded: boolean) => void;
  toggleDynasty: (dynastyId: string) => void;
  expandAllDynasties: () => void;
  collapseAllDynasties: () => void;
  getExpandedDynastiesCount: () => number;
  getTotalDynastiesCount: () => number;
  setDynastyIds: (ids: string[]) => void;
}

export const useDynastiesStore = create<DynastiesState>((set, get) => ({
  expandedStates: dynastiesStorage.getExpanded(),
  dynastyIds: [],

  isDynastyExpanded: (dynastyId: string): boolean => {
    const { expandedStates } = get();
    return expandedStates[dynastyId] !== false; // 默认展开
  },

  setDynastyExpanded: (dynastyId: string, expanded: boolean) => {
    set((state) => {
      const newStates = { ...state.expandedStates, [dynastyId]: expanded };
      dynastiesStorage.setExpanded(newStates);
      return { expandedStates: newStates };
    });
  },

  toggleDynasty: (dynastyId: string) => {
    const { isDynastyExpanded, setDynastyExpanded } = get();
    const currentState = isDynastyExpanded(dynastyId);
    setDynastyExpanded(dynastyId, !currentState);
  },

  expandAllDynasties: () => {
    const { dynastyIds } = get();
    set((state) => {
      const newStates: Record<string, boolean> = { ...state.expandedStates };
      dynastyIds.forEach(id => {
        newStates[id] = true;
      });
      dynastiesStorage.setExpanded(newStates);
      return { expandedStates: newStates };
    });
  },

  collapseAllDynasties: () => {
    const { dynastyIds } = get();
    set((state) => {
      const newStates: Record<string, boolean> = { ...state.expandedStates };
      dynastyIds.forEach(id => {
        newStates[id] = false;
      });
      dynastiesStorage.setExpanded(newStates);
      return { expandedStates: newStates };
    });
  },

  getExpandedDynastiesCount: (): number => {
    const { expandedStates, dynastyIds } = get();
    return dynastyIds.filter(id => expandedStates[id] !== false).length;
  },

  getTotalDynastiesCount: (): number => {
    const { dynastyIds } = get();
    return dynastyIds.length;
  },

  setDynastyIds: (ids: string[]) => {
    set({ dynastyIds: ids });
  },
}));

// 监听跨标签页的状态变化
StorageListener.addListener(STORAGE_KEYS.DYNASTIES_EXPANDED, (_, newValue) => {
  if (newValue && typeof newValue === 'object') {
    useDynastiesStore.setState({ expandedStates: newValue });
  }
});

export const useDynastiesExpanded = () => useDynastiesStore();
