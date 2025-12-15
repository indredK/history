import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import './CulturePage.css';
import { useDynastyStore } from '../../store';
import { getDynasties } from '../../services/dataClient';
import { useRequest } from 'ahooks';
import type { Dynasty } from '../../services/culture/types';

function CulturePage() {
  const { dynasties, setDynasties, setSelectedDynasty } = useDynastyStore();

  // 使用ahooks的useRequest获取数据
  useRequest(
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

  return (
    <Box className="culture-page">
      <Typography variant="h4" component="h1" sx={{ 
        mb: 3,
        color: 'var(--color-text-primary)',
        fontWeight: 'bold'
      }}>
        中国朝代
      </Typography>
      
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
      {useDynastyStore(state => state.selectedDynasty) && (
        <Box sx={{ mt: 4, p: 3, background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <Typography variant="h5" component="h2" sx={{ 
            mb: 2,
            color: 'var(--color-text-primary)',
            fontWeight: 'bold'
          }}>
            {useDynastyStore(state => state.selectedDynasty)?.name} 详情
          </Typography>
          <Typography variant="body1" sx={{ 
            color: 'var(--color-text-secondary)',
            lineHeight: 1.8
          }}>
            {useDynastyStore(state => state.selectedDynasty)?.description}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Chip 
              label={`开始年份: ${useDynastyStore(state => state.selectedDynasty)?.startYear}`} 
              size="small"
            />
            <Chip 
              label={`结束年份: ${useDynastyStore(state => state.selectedDynasty)?.endYear}`} 
              size="small"
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default CulturePage;