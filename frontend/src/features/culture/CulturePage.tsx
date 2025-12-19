import { Box, Typography, Card, CardContent, Chip, IconButton } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useRequest } from 'ahooks';

import { useDynastyStore } from '@/store';
import { getDynasties } from '@/services/dataClient';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useDynastiesExpanded } from '@/hooks';
import type { Dynasty } from '@/services/culture/types';
import { dynastyConfig } from '@/config';

import './CulturePage.css';

function CulturePage() {
  const { dynasties, setDynasties, setSelectedDynasty, selectedDynasty } = useDynastyStore();
  
  // 时期分类展开状态管理
  const {
    isDynastyExpanded,
    toggleDynasty
  } = useDynastiesExpanded();

  // 使用 ahooks 的 useRequest
  const { loading, error } = useRequest(
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
          backgroundColor: '#f5f5f5',
          borderLeft: '4px solid #1976d2',
          borderRadius: 1,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: '#e8f5e8',
            transform: 'translateX(2px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }
        }}
        onClick={() => toggleDynasty(period)}
      >
        <Box>
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold',
            color: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            {period}
            <Typography 
              component="span" 
              sx={{ 
                fontSize: '0.8rem', 
                color: '#666',
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
              color: '#1976d2'
            }}
          />
        </IconButton>
      </Box>
    );
  };



  return (
    <Box className="culture-page">
      <Typography variant="h4" component="h1" sx={{ 
        mb: 3,
        color: 'var(--color-text-primary)',
        fontWeight: 'bold'
      }}>
        中国朝代
      </Typography>
      
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
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
            {error.message || '请检查网络连接后重试'}
          </Typography>
        </Box>
      ) : (
        <Box className="culture-content">
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
                                color: '#fff',
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
                                color: '#4CAF50'
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
        </Box>
      )}
    </Box>
  );
}

export default CulturePage;