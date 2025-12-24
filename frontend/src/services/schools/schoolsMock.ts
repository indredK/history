// 重新导出统一服务，保持向后兼容
import { getSchools, getSchoolById } from './schoolsApi';

export { getSchools, getSchoolById };

export const schoolsMock = {
  getSchools,
  getSchool: getSchoolById,
};