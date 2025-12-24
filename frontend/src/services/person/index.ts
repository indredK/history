// 统一的人物服务导出

// 基础类型定义
export * from './types';

// 通用人物服务
export * from './common';

// 清朝统治者服务
export * from './qing';

// 学者服务
export * from './scholars';

// 子模块导入指南：
// 如需使用特定时期的人物服务，请直接从对应模块导入
// 示例：
// import { qingRulerService } from '@/services/person/qing';
// import { scholarService } from '@/services/person/scholars';
// import { getSanguoFigures } from '@/services/person/sanguo';
// import { getTangFigures } from '@/services/person/tang';
// import { getSongFigures } from '@/services/person/song';
// import { getYuanFigures } from '@/services/person/yuan';
// import { getMingFigures } from '@/services/person/ming';