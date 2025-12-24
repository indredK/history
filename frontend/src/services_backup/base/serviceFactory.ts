/**
 * 服务工厂 - 统一创建API和Mock服务
 * 重新导出utils/services中的工厂函数，保持向后兼容
 */

// 重新导出，保持向后兼容
export { createUnifiedService } from '@/utils/services/serviceFactory';
export type { BaseService, ServiceOptions } from '@/utils/services/serviceFactory';