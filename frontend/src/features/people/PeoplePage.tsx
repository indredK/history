import { Box, Typography, Card, CardContent, Avatar, Chip, Skeleton } from '@mui/material';
import './PeoplePage.css';
import { usePersonsStore } from '@/store';
import { getPersons } from '@/services/dataClient';
import { useRequest } from 'ahooks';
import type { Person as ServicePerson } from '@/services/person/types';

function PeoplePage() {
  const { persons, setPersons } = usePersonsStore();

  // 使用ahooks的useRequest获取数据
  const { loading, error } = useRequest(
    async () => {
      const result = await getPersons();
      return result.data;
    },
    {
      cacheKey: 'persons',
      manual: false,
      onSuccess: (data) => setPersons(data)
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
                <Skeleton variant="circular" width={56} height={56} sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={28} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
                </Box>
              </Box>
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box className="people-page">
      <Typography variant="h4" component="h1" sx={{ 
        mb: 3,
        color: 'var(--color-text-primary)',
        fontWeight: 'bold'
      }}>
        历史人物
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
        <Box className="people-content" sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {persons.map((person: ServicePerson) => (
            <Box sx={{ flexBasis: { xs: '100%', sm: '48%', md: '31%' } }} key={person.id}>
              <Card sx={{
                height: '100%',
                background: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                transition: 'all var(--transition-normal)',
                '&:hover': {
                  boxShadow: 'var(--shadow-lg)',
                  transform: 'translateY(-4px)'
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ 
                      width: 56, 
                      height: 56, 
                      mr: 2,
                      background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)'
                    }}>
                      {person.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h2" sx={{
                        color: 'var(--color-text-primary)',
                        fontWeight: 'bold'
                      }}>
                        {person.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        {person.roles && person.roles.map((role, index) => (
                          <Chip 
                            key={index}
                            label={role} 
                            size="small" 
                            variant="outlined"
                            sx={{ borderColor: '#4CAF50', color: '#4CAF50' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" sx={{
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6
                  }}>
                    {person.biography || '暂无详细信息'}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default PeoplePage;