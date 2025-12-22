/**
 * 文化页面
 * Culture Page
 * 
 * 展示中国朝代和文化名人（唐宋八大家）
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2
 */

import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Card, CardContent, Chip, IconButton, Button } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useRequest } from 'ahooks';

import { useDynastyStore, useScholarStore } from '@/store';
import { getDynasties } from '@/services/dataClient';
import { scholarMock } from '@/services/scholar';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useDynastiesExpanded } from '@/hooks';
import type { Dynasty } from '@/services/culture/types';
import type { Scholar } from '@/services/scholar/types';
import { dynastyConfig } from '@/config';

import {
  CultureTabs,
  ScholarFilter,
  ScholarGrid,
  ScholarDetailModal,
} from './components';

import './CulturePage.css';

type TabValue = 'dynasties' | 'scholars';

function CulturePage() {
  // Tab state - Requirements 6.3: 保持标签状态
  const [activeTab, setActiveTab] = useState<TabValue>('dynasties');
  
  // Dynasty store
  const { dynasties, setDynasties, setSelectedDynasty, selectedDynasty } = useDynastyStore();
  
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
  
  // 时期分类展开状态管理
  const {
    isDynastyExpanded,
    toggleDynasty
  } = useDynastiesExpanded();

  // 使用 ahooks 的 useRequest 加载朝代数据
  const { loading: dynastyLoading, error: dynastyError } = useRequest(
    async () => {
      const result = await getDynasties();
      return result.data;
    },
    {
      cacheKey: 'dynasties',
      onSuccess: setDynasties,
      onError: (err) => console.error('获取朝代数据失败:', err)
    }
  );

  // 加载学者数据
  const { run: loadScholars, loading: scholarsRequestLoading } = useRequest(
    async () => {
      const result = await scholarMock.getScholars();
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

  // 当切换到学者标签时加载数据
  useEffect(() => {
    if (activeTab === 'scholars' && scholars.length === 0 && !scholarLoading) {
      loadScholars();
    }
  }, [activeTab, scholars.length, scholarLoading, loadScholars]);

  // 获取筛选后的学者列表
  const filteredScholars = useMemo(() => {
    return getFilteredScholars();
  }, [getFilteredScholars, scholars, filters]);

  // 获取筛选选项
  const dynastyOptions = useMemo(() => {
    const uniqueDynasties = [...new Set(scholars.map(s => s.dynasty))];
    return ['全部', ...uniqueDynasties];
  }, [scholars]);

  const schoolOptions = useMemo(() => {
    const uniqueSchools = [...new Set(scholars.map(s => s.schoolOfThought))];
    return ['全部', ...uniqueSchools];
  }, [scholars]);

  // 按时期分类朝代
  const groupedDynasties = (dynasties || []).reduce((acc: Record<string, Dynasty[]>, dynasty) => {
    let period = '';
    const startYear = parseInt(dynasty.startYear?.toString() || '0');
    
    if (startYear < 0) {
      period = '先秦时期';
    } else if (startYear < 220) {
      period = '秦汉时期';
    } else if (startYear < 589) {
      period = '魏晋南北朝';
    } else if (startYear < 960) {
      period = '隋唐五代';
    } else if (startYear < 1368) {
      period = '宋元时期';
    } else if (startYear < 1644) {
      period = '明朝时期';
    } else if (startYear < 1912) {
      period = '清朝时期';
    } else {
      period = '近现代';
    }
    
    if (!acc[period]) {
      acc[period] = [];
    }
    acc[period]!.push(dynasty);
    return acc;
  }, {});

  // 处理学者卡片点击
  const handleScholarClick = (scholar: Scholar) => {
    setSelectedScholar(scholar);
  };

  // 关闭学者详情弹窗
  const handleCloseScholarModal = () => {
    setSelectedScholar(null);
  };

  // 渲染时期分类标题
  const renderPeriodHeader = (period: string, count: number) => {
    const isExpanded = isDynastyExpanded(period);
    
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          p: 2,
          backgroundColor: 'var(--color-bg-tertiary)',
          borderLeft: '4px solid var(--color-primary)',
          borderRadius: 1,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'var(--theme-hover-bg)',
            transform: 'translateX(2px)',
            boxShadow: 'var(--shadow-sm)'
          }
        }}
        onClick={() => toggleDynasty(period)}
      >
        <Box>
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            {period}
            <Typography 
              component="span" 
              sx={{ 
                fontSize: '0.8rem', 
                color: 'var(--color-text-secondary)',
                fontWeight: 'normal'
              }}
            >
              ({count}个朝代) {isExpanded ? '(点击收起)' : '(点击展开)'}
            </Typography>
          </Typography>
        </Box>
        <IconButton size="small">
          <ExpandLessIcon 
            sx={{ 
              transition: 'transform 0.2s ease-in-out',
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              color: 'var(--color-primary)'
            }}
          />
        </IconButton>
      </Box>
    );
  };

  // 渲染朝代内容
  const renderDynastiesContent = () => {
    if (dynastyLoading) {
      return <LoadingSkeleton />;
    }

    if (dynastyError) {
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
          <Typography variant="body2">
            {dynastyError.message || '请检查网络连接后重试'}
          </Typography>
        </Box>
      );
    }

    return (
      <>
        {Object.entries(groupedDynasties).map(([period, periodDynasties]) => (
          <Box key={period} sx={{ mb: 4 }}>
            {renderPeriodHeader(period, periodDynasties.length)}
            
            {isDynastyExpanded(period) && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {periodDynasties.map((dynasty: Dynasty) => (
                  <Box sx={{ flexBasis: { xs: '100%', sm: '48%', md: '31%' } }} key={dynasty.id}>
                    <Card sx={{
                      height: '100%',
                      background: 'var(--color-bg-card)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-md)',
                      transition: 'all var(--transition-normal)',
                      '&:hover': {
                        boxShadow: 'var(--shadow-lg)',
                        transform: 'translateY(-4px)',
                        cursor: 'pointer'
                      }
                    }} 
                    onClick={() => setSelectedDynasty(dynasty)}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box 
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: dynasty.color || dynastyConfig.defaultColor,
                              mr: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Typography variant="body1" sx={{ 
                              color: 'var(--color-text-inverse)',
                              fontWeight: 'bold'
                            }}>
                              {dynasty.name.charAt(0)}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="h6" component="h2" sx={{
                              color: 'var(--color-text-primary)',
                              fontWeight: 'bold'
                            }}>
                              {dynasty.name}
                            </Typography>
                            <Typography variant="body2" sx={{
                              color: 'var(--color-text-secondary)',
                              mt: 0.5
                            }}>
                              {dynasty.name_en}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" sx={{
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.6,
                          mb: 2
                        }}>
                          {dynasty.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip 
                            label={`${dynasty.startYear} - ${dynasty.endYear}`} 
                            size="small" 
                            sx={{ 
                              background: 'rgba(76, 175, 80, 0.1)',
                              color: 'var(--color-green)'
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        ))}
        
        {/* 显示选中朝代的详细信息 */}
        {selectedDynasty && (
          <Box sx={{ mt: 4, p: 3, background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <Typography variant="h5" component="h2" sx={{ 
              mb: 2,
              color: 'var(--color-text-primary)',
              fontWeight: 'bold'
            }}>
              {selectedDynasty.name} 详情
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'var(--color-text-secondary)',
              lineHeight: 1.8
            }}>
              {selectedDynasty.description}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Chip 
                label={`开始年份: ${selectedDynasty.startYear}`} 
                size="small"
              />
              <Chip 
                label={`结束年份: ${selectedDynasty.endYear}`} 
                size="small"
              />
            </Box>
          </Box>
        )}
      </>
    );
  };

  // 渲染学者内容 - Requirements 7.1, 7.2
  const renderScholarsContent = () => {
    // 错误状态 - Requirements 7.2
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

  return (
    <Box className="culture-page">
      {/* 标签切换 - Requirements 6.1, 6.2 */}
      <CultureTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <Box className="culture-content">
        {activeTab === 'dynasties' ? renderDynastiesContent() : renderScholarsContent()}
      </Box>
    </Box>
  );
}

export default CulturePage;
