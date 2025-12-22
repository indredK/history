/**
 * 神话数据类型定义
 * Mythology Data Type Definitions
 * 
 * Requirements: 1.1, 1.2
 */

/**
 * 神话分类类型
 */
export type MythologyCategory = 
  | '创世神话'   // 如：盘古开天、女娲造人
  | '英雄神话'   // 如：后羿射日、大禹治水
  | '自然神话'   // 如：夸父追日、精卫填海
  | '爱情神话';  // 如：牛郎织女、嫦娥奔月

/**
 * 有效的神话分类列表
 */
export const VALID_CATEGORIES: MythologyCategory[] = [
  '创世神话',
  '英雄神话',
  '自然神话',
  '爱情神话'
];

/**
 * 神话数据接口
 */
export interface Mythology {
  /** 唯一标识符 */
  id: string;
  /** 中文标题 */
  title: string;
  /** 英文标题（可选） */
  englishTitle?: string;
  /** 神话分类 */
  category: MythologyCategory;
  /** 故事描述 */
  description: string;
  /** 相关人物 */
  characters: string[];
  /** 出处/来源（可选） */
  source?: string;
  /** 配图URL（可选） */
  imageUrl?: string;
}

/**
 * 神话状态接口（用于 Zustand store）
 */
export interface MythologyState {
  /** 神话列表 */
  mythologies: Mythology[];
  /** 当前选中的神话（用于详情弹窗） */
  selectedMythology: Mythology | null;
  /** 当前活动的分类筛选 */
  activeCategory: MythologyCategory | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 神话操作接口（用于 Zustand store）
 */
export interface MythologyActions {
  /** 设置神话列表 */
  setMythologies: (mythologies: Mythology[]) => void;
  /** 设置选中的神话 */
  setSelectedMythology: (mythology: Mythology | null) => void;
  /** 设置活动分类 */
  setActiveCategory: (category: MythologyCategory | null) => void;
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;
  /** 设置错误信息 */
  setError: (error: string | null) => void;
  /** 获取筛选后的神话列表 */
  getFilteredMythologies: () => Mythology[];
}

/**
 * 神话 Store 类型（状态 + 操作）
 */
export type MythologyStore = MythologyState & MythologyActions;
