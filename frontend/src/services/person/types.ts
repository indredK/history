// 统一的人物类型定义

// 基础人物接口
export interface BasePerson {
  id: string;
  name: string;
  name_en?: string;
  description?: string;
  imageUrl?: string;
  birth_year?: number;
  death_year?: number;
  created_at?: string;
  updated_at?: string;
}

// 通用人物类型
export interface Person extends BasePerson {
  // 继承基础人物属性
}

// 重新导出各个子模块的类型
export type { Emperor } from './emperors/types';
export type { SanguoFigure, SanguoFigureRole, SanguoKingdom } from './sanguo/types';
export type { TangFigure, TangFigureRole } from './tang/types';
export type { SongFigure, SongFigureRole } from './song/types';
export type { YuanFigure, YuanFigureRole } from './yuan/types';
export type { MingFigure, MingFigureRole } from './ming/types';
export type { QingRuler } from './qing/types';
export type { Scholar } from './scholars/types';