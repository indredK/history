import { Box, Typography, Card, CardContent, Avatar, Chip } from '@mui/material';
import './PeoplePage.css';
import { usePersonsStore } from '../../store';
import { getPersons } from '../../services/dataClient';
import { useRequest } from 'ahooks';
import type { Person as ServicePerson } from '../../services/person/types';

function PeoplePage() {
  const { persons, setPersons } = usePersonsStore();

  // 使用ahooks的useRequest获取数据
  useRequest(
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

  return (
    <Box className="people-page">
      <Typography variant="h4" component="h1" sx={{ 
        mb: 3,
        color: 'var(--color-text-primary)',
        fontWeight: 'bold'
      }}>
        历史人物
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
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
    </Box>
  );
}

export default PeoplePage;