import { Box, Typography, Card, CardContent, Avatar, Chip } from '@mui/material';
import './PeoplePage.css';

interface Person {
  id: string;
  name: string;
  dynasty: string;
  occupation: string;
  description: string;
  avatar?: string;
}

const mockPeople: Person[] = [
  {
    id: '1',
    name: '孔子',
    dynasty: '春秋',
    occupation: '思想家',
    description: '儒家学派创始人，中国古代著名的思想家、教育家'
  },
  {
    id: '2',
    name: '李白',
    dynasty: '唐朝',
    occupation: '文人学者',
    description: '唐代著名浪漫主义诗人，被誉为"诗仙"'
  },
  {
    id: '3',
    name: '岳飞',
    dynasty: '宋朝',
    occupation: '军事将领',
    description: '南宋抗金名将，民族英雄'
  }
];

function PeoplePage() {
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
        {mockPeople.map((person) => (
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
                      <Chip 
                        label={person.dynasty} 
                        size="small" 
                        sx={{ 
                          background: 'rgba(76, 175, 80, 0.1)',
                          color: '#4CAF50'
                        }}
                      />
                      <Chip 
                        label={person.occupation} 
                        size="small" 
                        variant="outlined"
                        sx={{ borderColor: '#4CAF50', color: '#4CAF50' }}
                      />
                    </Box>
                  </Box>
                </Box>
                
                <Typography variant="body2" sx={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6
                }}>
                  {person.description}
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