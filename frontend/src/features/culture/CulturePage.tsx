/**
 * 文化页面
 * Culture Page
 * 
 * 展示中国思想流派（诸子百家）
 * 使用公共的FixedTabsPage组件
 * 
 * Requirements: 2.1, 2.2, 2.3, 3.1, 4.1, 5.1, 5.2, 5.3
 */

import { useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useRequest } from 'ahooks';

import { useSchoolsStore } from '@/store';
import { getSchools } from '@/services/school';
import type { PhilosophicalSchool } from '@/services/school/types';

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
  } = useSchoolsStore();

  // 加载思想流派数据
  const { run: loadSchools, loading: schoolsRequestLoading } = useRequest(
    async () => {
      const result = await getSchools();
      return result.data;
    },
    {
      manual: true,
      cacheKey: 'schools',
      onBefore: () => setSchoolsLoading(true),
      onSuccess: (data) => {
        setSchools(data);
        setSchoolsError(null);
      },
      onError: (err) => {
        console.error('获取思想流派数据失败:', err);
        setSchoolsError(err);
      },
      onFinally: () => setSchoolsLoading(false),
    }
  );

  // 当组件挂载时加载数据
  useEffect(() => {
    if (schools.length === 0 && !schoolsLoading && !schoolsRequestLoading) {
      loadSchools();
    }
  }, [schools.length, schoolsLoading, schoolsRequestLoading, loadSchools]);

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
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '200px',
          color: 'var(--color-text-secondary)'
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            加载失败
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {schoolsError.message || '请检查网络连接后重试'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => loadSchools()}
          >
            重试
          </Button>
        </Box>
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
    />
  );
}

export default CulturePage;
