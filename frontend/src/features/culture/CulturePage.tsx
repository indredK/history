import { Box, Typography, Card, CardContent, Chip, Skeleton } from '@mui/material';
import './CulturePage.css';
import { useDynastyStore } from '../../store';
import { getDynasties } from '../../services/dataClient';
import { useRequest } from 'ahooks';
import type { Dynasty } from '../../services/culture/types';

function CulturePage() {
  const { dynasties, setDynasties, setSelectedDynasty, selectedDynasty } = useDynastyStore();

  // 使用ahooks的useRequest获取数据
  const { loading, error } = useRequest(
    async () => {
      const result = await getDynasties();
      return result.data;
    },
    {
      cacheKey: 'dynasties',
      manual: false,
      onSuccess: (data) => setDynasties(data)
    }
  );

  // 加载状态组件
  const LoadingSkeleton = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Box sx={{ flexBasis: { xs: '100%', sm: '48%', md: '31%' } }} key={index}>
          <Card sx={{
            height: '100%',
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={28} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mt: 0.5 }} />
                </Box>
              </Box>
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="rectangular" width="30%" height={24} sx={{ mt: 2, borderRadius: '12px' }} />
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );

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
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {dynasties.map((dynasty: Dynasty) => (
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
                          background: dynasty.color,
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