import { Box, Typography, Card, CardContent, Avatar, Chip, Skeleton, IconButton } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import './PeoplePage.css';
import { usePersonsStore } from '@/store';
import { getPersons } from '@/services/dataClient';
import { useRequest } from 'ahooks';
import { useDynastiesExpanded } from '@/hooks';
import type { Person as ServicePerson } from '@/services/person/types';

function PeoplePage() {
  const { persons, setPersons } = usePersonsStore();
  
  // 职业分类展开状态管理
  const {
    isDynastyExpanded,
    toggleDynasty
  } = useDynastiesExpanded();

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

  // 按职业分类人物
  const groupedPersons = (persons || []).reduce((acc: Record<string, ServicePerson[]>, person) => {
    const primaryRole = person.roles?.[0] || '其他';
    if (!acc[primaryRole]) {
      acc[primaryRole] = [];
    }
    acc[primaryRole].push(person);
    return acc;
  }, {});

  // 渲染职业分类标题
  const renderCategoryHeader = (category: string, count: number) => {
    const isExpanded = isDynastyExpanded(category);
    
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
        onClick={() => toggleDynasty(category)}
      >
        <Box>
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold',
            color: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            {category}
            <Typography 
              component="span" 
              sx={{ 
                fontSize: '0.8rem', 
                color: '#666',
                fontWeight: 'normal'
              }}
            >
              ({count}人) {isExpanded ? '(点击收起)' : '(点击展开)'}
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
        <Box className="people-content">
          {Object.entries(groupedPersons).map(([category, categoryPersons]) => (
            <Box key={category} sx={{ mb: 4 }}>
              {renderCategoryHeader(category, categoryPersons.length)}
              
              {isDynastyExpanded(category) && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {categoryPersons.map((person: ServicePerson) => (
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
          ))}
        </Box>
      )}
    </Box>
  );
}

export default PeoplePage;