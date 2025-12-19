import { Box, Typography, Container, Card, CardContent, IconButton } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useDynastiesExpanded } from '@/hooks';

import './MajorEventsPage.css';

// 示例重大事件数据
const majorEventsData = {
  '政治变革': [
    { id: 1, title: '商汤灭夏', period: '约前1600年', description: '商汤推翻夏朝统治，建立商朝，开启中国历史新篇章。' },
    { id: 2, title: '武王伐纣', period: '约前1046年', description: '周武王联合各诸侯国推翻商朝，建立西周王朝。' },
    { id: 3, title: '秦始皇统一六国', period: '前221年', description: '秦始皇嬴政统一六国，建立中国历史上第一个统一的封建王朝。' }
  ],
  '重要战争': [
    { id: 4, title: '长平之战', period: '前260年', description: '秦赵两国在长平展开大战，秦军大胜，为统一奠定基础。' },
    { id: 5, title: '赤壁之战', period: '208年', description: '孙刘联军在赤壁大败曹操，奠定三国鼎立格局。' },
    { id: 6, title: '安史之乱', period: '755-763年', description: '唐朝由盛转衰的重要转折点，对后世影响深远。' }
  ],
  '文化发展': [
    { id: 7, title: '春秋战国百家争鸣', period: '前770-前221年', description: '中国思想史上的黄金时代，诸子百家学说繁荣。' },
    { id: 8, title: '科举制度建立', period: '605年', description: '隋朝建立科举制，为后世选拔人才奠定制度基础。' },
    { id: 9, title: '四大发明', period: '汉-宋', description: '造纸术、指南针、火药、印刷术的发明和传播。' }
  ]
};

function MajorEventsPage() {
  // 事件分类展开状态管理
  const {
    isDynastyExpanded,
    toggleDynasty
  } = useDynastiesExpanded();

  // 渲染事件分类标题
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
              ({count}个事件) {isExpanded ? '(点击收起)' : '(点击展开)'}
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
    <Container maxWidth="lg">
      <Box className="major-events-page">
        <Typography variant="h4" component="h1" sx={{ 
          mb: 3,
          color: 'var(--color-text-primary)',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          重大事件
        </Typography>
        
        <Box>
          {Object.entries(majorEventsData).map(([category, events]) => (
            <Box key={category} sx={{ mb: 4 }}>
              {renderCategoryHeader(category, events.length)}
              
              {isDynastyExpanded(category) && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {events.map((event) => (
                    <Card key={event.id} sx={{
                      background: 'var(--color-bg-card)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-md)',
                      transition: 'all var(--transition-normal)',
                      '&:hover': {
                        boxShadow: 'var(--shadow-lg)',
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" component="h3" sx={{
                            color: 'var(--color-text-primary)',
                            fontWeight: 'bold'
                          }}>
                            {event.title}
                          </Typography>
                          <Typography variant="body2" sx={{
                            color: '#1976d2',
                            fontWeight: 'medium',
                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}>
                            {event.period}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.6
                        }}>
                          {event.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
}

export default MajorEventsPage;