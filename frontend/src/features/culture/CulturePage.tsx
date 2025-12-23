/**
 * 文化页面
 * Culture Page
 * 
 * 展示中国思想流派（诸子百家）和文化名人（唐宋八大家）
 * 使用公共的FixedTabsPage组件
 * 
 * Requirements: 2.1, 2.2, 2.3, 3.1, 4.1, 5.1, 5.2, 5.3
 */

import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import { useRequest } from 'ahooks';

import { useScholarStore, useSchoolsStore } from '@/store';
import { getScholars } from '@/services/scholar';
import { getSchools } from '@/services/schools';
import type { Scholar } from '@/services/scholar/types';
import type { PhilosophicalSchool } from '@/services/schools/types';

import { FixedTabsPage, type FixedTabConfig } from '@/components/common';
import {
  ScholarFilter,
  ScholarGrid,
  ScholarDetailModal,
  SchoolDetail,
  SchoolsList,
} from './components';

import './CulturePage.css';

function CulturePage() {
  // Tab state - 默认显示思想流派
  const [activeTab, setActiveTab] = useState<string>('schools');
  
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
  
  // Scholar store
  const {
    scholars,
    selectedScholar,
    loading: scholarLoading,
    error: scholarError,
    filters,
    setScholars,
    setSelectedScholar,
    setLoading: setScholarLoading,
    setError: setScholarError,
    setDynastyFilter,
    setSchoolFilter,
    getFilteredScholars,
  } = useScholarStore();

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

  // 加载学者数据
  const { run: loadScholars, loading: scholarsRequestLoading } = useRequest(
    async () => {
      const result = await getScholars();
      return result.data;
    },
    {
      manual: true,
      cacheKey: 'scholars',
      onBefore: () => setScholarLoading(true),
      onSuccess: (data) => {
        setScholars(data);
        setScholarError(null);
      },
      onError: (err) => {
        console.error('获取学者数据失败:', err);
        setScholarError(err);
      },
      onFinally: () => setScholarLoading(false),
    }
  );

  // 当切换到思想流派标签时加载数据
  useEffect(() => {
    if (activeTab === 'schools' && schools.length === 0 && !schoolsLoading && !schoolsRequestLoading) {
      loadSchools();
    }
  }, [activeTab, schools.length, schoolsLoading, schoolsRequestLoading, loadSchools]);

  // 当切换到学者标签时加载数据
  useEffect(() => {
    if (activeTab === 'scholars' && scholars.length === 0 && !scholarLoading && !scholarsRequestLoading) {
      loadScholars();
    }
  }, [activeTab, scholars.length, scholarLoading, scholarsRequestLoading, loadScholars]);

  // 获取筛选后的学者列表
  const filteredScholars = useMemo(() => {
    return getFilteredScholars();
  }, [getFilteredScholars, scholars, filters]);

  // 获取筛选选项
  const dynastyOptions = useMemo(() => {
    const uniqueDynasties = [...new Set(
      scholars
        .map(s => s.dynasty || s.dynastyPeriod)
        .filter((dynasty): dynasty is string => Boolean(dynasty))
    )];
    return ['全部', ...uniqueDynasties];
  }, [scholars]);

  const schoolOptions = useMemo(() => {
    const uniqueSchools = [...new Set(
      scholars
        .map(s => s.schoolOfThought)
        .filter((school): school is string => Boolean(school))
    )];
    return ['全部', ...uniqueSchools];
  }, [scholars]);

  // 处理思想流派卡片点击
  const handleSchoolClick = (school: PhilosophicalSchool) => {
    setSelectedSchool(school);
  };

  // 关闭思想流派详情弹窗
  const handleCloseSchoolDetail = () => {
    setSelectedSchool(null);
  };

  // 处理学者卡片点击
  const handleScholarClick = (scholar: Scholar) => {
    setSelectedScholar(scholar);
  };

  // 关闭学者详情弹窗
  const handleCloseScholarModal = () => {
    setSelectedScholar(null);
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

  // 渲染学者内容
  const renderScholarsContent = () => {
    // 错误状态
    if (scholarError) {
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
            {scholarError.message || '请检查网络连接后重试'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => loadScholars()}
          >
            重试
          </Button>
        </Box>
      );
    }

    return (
      <>
        {/* 筛选器 */}
        <ScholarFilter
          selectedDynasty={filters.dynasty}
          selectedSchool={filters.schoolOfThought}
          onDynastyChange={setDynastyFilter}
          onSchoolChange={setSchoolFilter}
          dynastyOptions={dynastyOptions}
          schoolOptions={schoolOptions}
          resultCount={filteredScholars.length}
        />

        {/* 学者网格 */}
        <ScholarGrid
          scholars={filteredScholars}
          onScholarClick={handleScholarClick}
          loading={scholarLoading || scholarsRequestLoading}
        />

        {/* 学者详情弹窗 */}
        <ScholarDetailModal
          scholar={selectedScholar}
          open={selectedScholar !== null}
          onClose={handleCloseScholarModal}
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
    {
      value: 'scholars',
      label: '文化名人',
      icon: <PersonIcon />,
      content: renderScholarsContent(),
    },
  ];

  return (
    <FixedTabsPage
      tabs={tabs}
      defaultTab="schools"
      className="culture-page"
      onTabChange={setActiveTab}
    />
  );
}

export default CulturePage;
