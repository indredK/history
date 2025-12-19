import { useState, useEffect, useCallback } from 'react';
import { dynastiesStorage, StorageListener, STORAGE_KEYS } from '@/utils/storage';

/**
 * 朝代展开状态管理 Hook
 * 提供朝代展开/收起状态的管理，并自动同步到 localStorage
 * 支持跨标签页状态同步
 */
export function useDynastiesExpanded() {
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>(() => {
    const initialStates = dynastiesStorage.getExpanded();
    console.debug('Dynasties expanded states loaded from localStorage:', initialStates);
    return initialStates;
  });

  // 获取单个朝代的展开状态
  const isDynastyExpanded = useCallback((dynastyId: string): boolean => {
    return expandedStates[dynastyId] !== false; // 默认展开
  }, [expandedStates]);

  // 设置单个朝代的展开状态
  const setDynastyExpanded = useCallback((dynastyId: string, expanded: boolean) => {
    setExpandedStates(prev => {
      const newStates = { ...prev, [dynastyId]: expanded };
      console.debug(`Dynasty ${dynastyId} expanded state changed to:`, expanded);
      return newStates;
    });
  }, []);

  // 切换单个朝代的展开状态
  const toggleDynasty = useCallback((dynastyId: string) => {
    const currentState = isDynastyExpanded(dynastyId);
    setDynastyExpanded(dynastyId, !currentState);
  }, [isDynastyExpanded, setDynastyExpanded]);

  // 展开所有朝代
  const expandAll = useCallback((dynastyIds: string[]) => {
    const newStates: Record<string, boolean> = {};
    dynastyIds.forEach(id => {
      newStates[id] = true;
    });
    setExpandedStates(prev => ({ ...prev, ...newStates }));
    console.debug('All dynasties expanded');
  }, []);

  // 收起所有朝代
  const collapseAll = useCallback((dynastyIds: string[]) => {
    const newStates: Record<string, boolean> = {};
    dynastyIds.forEach(id => {
      newStates[id] = false;
    });
    setExpandedStates(prev => ({ ...prev, ...newStates }));
    console.debug('All dynasties collapsed');
  }, []);

  // 切换所有朝代的展开状态
  const toggleAll = useCallback((dynastyIds: string[]) => {
    // 检查是否所有朝代都已展开
    const allExpanded = dynastyIds.every(id => expandedStates[id] !== false);
    
    if (allExpanded) {
      collapseAll(dynastyIds);
    } else {
      expandAll(dynastyIds);
    }
  }, [expandedStates, expandAll, collapseAll]);

  // 检查是否所有朝代都已展开
  const areAllExpanded = useCallback((dynastyIds: string[]): boolean => {
    return dynastyIds.every(id => expandedStates[id] !== false);
  }, [expandedStates]);

  // 检查是否所有朝代都已收起
  const areAllCollapsed = useCallback((dynastyIds: string[]): boolean => {
    return dynastyIds.every(id => expandedStates[id] === false);
  }, [expandedStates]);

  // 监听状态变化，自动保存到 localStorage
  useEffect(() => {
    dynastiesStorage.setExpanded(expandedStates);
  }, [expandedStates]);

  // 监听跨标签页的状态变化
  useEffect(() => {
    const handleStorageChange = (key: string, newValue: Record<string, boolean>) => {
      if (key === STORAGE_KEYS.DYNASTIES_EXPANDED && newValue !== expandedStates) {
        console.debug('Dynasties expanded states synced from another tab:', newValue);
        setExpandedStates(newValue || {});
      }
    };

    StorageListener.addListener(STORAGE_KEYS.DYNASTIES_EXPANDED, handleStorageChange);

    return () => {
      StorageListener.removeListener(STORAGE_KEYS.DYNASTIES_EXPANDED, handleStorageChange);
    };
  }, [expandedStates]);

  // 全部展开（不需要传入dynastyIds，自动处理所有朝代）
  const expandAllDynasties = useCallback(() => {
    // 获取所有已知的朝代ID
    const allDynastyIds = Object.keys(expandedStates);
    
    // 如果没有已知的朝代ID，使用默认的朝代列表
    const defaultDynastyIds = [
      'wudi', 'xia', 'shang', 'xizhou', 'dongzhou', 'qin', 'xihan', 'donghan',
      'sanguo', 'jin', 'nanchao', 'beichao', 'sui', 'tang', 'wudai', 'beisong',
      'nansong', 'liao', 'jin_dynasty', 'yuan', 'ming', 'qing', 'minguo', 'zhonghua'
    ];
    
    const dynastyIds = allDynastyIds.length > 0 ? allDynastyIds : defaultDynastyIds;
    expandAll(dynastyIds);
  }, [expandedStates, expandAll]);

  // 全部收起（不需要传入dynastyIds，自动处理所有朝代）
  const collapseAllDynasties = useCallback(() => {
    // 获取所有已知的朝代ID
    const allDynastyIds = Object.keys(expandedStates);
    
    // 如果没有已知的朝代ID，使用默认的朝代列表
    const defaultDynastyIds = [
      'wudi', 'xia', 'shang', 'xizhou', 'dongzhou', 'qin', 'xihan', 'donghan',
      'sanguo', 'jin', 'nanchao', 'beichao', 'sui', 'tang', 'wudai', 'beisong',
      'nansong', 'liao', 'jin_dynasty', 'yuan', 'ming', 'qing', 'minguo', 'zhonghua'
    ];
    
    const dynastyIds = allDynastyIds.length > 0 ? allDynastyIds : defaultDynastyIds;
    collapseAll(dynastyIds);
  }, [expandedStates, collapseAll]);

  // 获取已展开的朝代数量
  const getExpandedDynastiesCount = useCallback((): number => {
    const defaultDynastyIds = [
      'wudi', 'xia', 'shang', 'xizhou', 'dongzhou', 'qin', 'xihan', 'donghan',
      'sanguo', 'jin', 'nanchao', 'beichao', 'sui', 'tang', 'wudai', 'beisong',
      'nansong', 'liao', 'jin_dynasty', 'yuan', 'ming', 'qing', 'minguo', 'zhonghua'
    ];
    
    return defaultDynastyIds.filter(id => expandedStates[id] !== false).length;
  }, [expandedStates]);

  // 获取朝代总数
  const getTotalDynastiesCount = useCallback((): number => {
    return 24; // 总共24个朝代
  }, []);

  return {
    expandedStates,
    isDynastyExpanded,
    setDynastyExpanded,
    toggleDynasty,
    expandAll,
    collapseAll,
    toggleAll,
    areAllExpanded,
    areAllCollapsed,
    expandAllDynasties,
    collapseAllDynasties,
    getExpandedDynastiesCount,
    getTotalDynastiesCount,
  };
}