/**
 * 文化页面
 * Culture Page
 * 
 * 展示中国思想流派（诸子百家）
 * 使用公共的FixedTabsPage组件
 * 
 * Requirements: 2.1, 2.2, 2.3, 3.1, 4.1, 5.1, 5.2, 5.3
 */

import MenuBookIcon from '@mui/icons-material/MenuBook';

import { useSchoolStore } from '@/store';
import { getSchools } from '@/services/school';
import type { PhilosophicalSchool } from '@/services/school/types';
import { useCollectionResource } from '@/hooks';
import { StateView } from '@/components/ui';

import { FixedTabsPage, type FixedTabConfig } from '@/components/common';
import {
  SchoolDetail,
  SchoolsList,
} from './components';

import './CulturePage.css';

function CulturePage() {
  // Schools store
  const {
    schools,
    selectedSchool,
    loading: schoolsLoading,
    error: schoolsError,
    setSchools,
    setSelectedSchool,
    setLoading: setSchoolsLoading,
    setError: setSchoolsError,
  } = useSchoolStore();

  // 加载思想流派数据
  const { reload: loadSchools, requestLoading: schoolsRequestLoading } =
    useCollectionResource({
      cacheKey: 'schools',
      items: schools,
      loading: schoolsLoading,
      load: async () => {
        const result = await getSchools();
        return result.data;
      },
      setItems: setSchools,
      setLoading: setSchoolsLoading,
      setError: setSchoolsError,
      errorMessage: '获取思想流派数据失败:',
    });

  // 处理思想流派卡片点击
  const handleSchoolClick = (school: PhilosophicalSchool) => {
    setSelectedSchool(school);
  };

  // 关闭思想流派详情弹窗
  const handleCloseSchoolDetail = () => {
    setSelectedSchool(null);
  };

  // 渲染思想流派内容
  const renderSchoolsContent = () => {
    // 错误状态 - Requirements 5.2
    if (schoolsError) {
      return (
        <StateView
          mode="error"
          title="加载失败"
          description={schoolsError.message || '请检查网络连接后重试'}
          actionLabel="重试"
          onAction={loadSchools}
        />
      );
    }

    return (
      <>
        {/* 思想流派列表 */}
        <SchoolsList
          schools={schools}
          onSchoolClick={handleSchoolClick}
          loading={schoolsLoading || schoolsRequestLoading}
        />

        {/* 思想流派详情弹窗 */}
        <SchoolDetail
          school={selectedSchool}
          open={selectedSchool !== null}
          onClose={handleCloseSchoolDetail}
        />
      </>
    );
  };

  // 定义标签页配置
  const tabs: FixedTabConfig[] = [
    {
      value: 'schools',
      label: '思想流派',
      icon: <MenuBookIcon />,
      content: renderSchoolsContent(),
    },
  ];

  return (
    <FixedTabsPage
      tabs={tabs}
      defaultTab="schools"
      className="culture-page"
      title="思想与学派"
      description="以诸子百家为轴，查看各学派的时代位置、代表人物与核心观念。"
    />
  );
}

export default CulturePage;
