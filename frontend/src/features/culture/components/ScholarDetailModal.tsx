/**
 * 学者详情弹窗组件
 * Scholar Detail Modal Component
 * 
 * 显示学者完整信息：传记、成就、代表作品
 * 支持关闭按钮、Escape键关闭、点击外部关闭
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { Scholar, LiteraryWork } from '@/services/people/scholars/types';

interface ScholarDetailModalProps {
  scholar: Scholar | null;
  open: boolean;
  onClose: () => void;
}

/**
 * 朝代颜色映射
 */
const dynastyColors: Record<string, { bg: string; text: string }> = {
  '唐代': { bg: 'rgba(156, 39, 176, 0.15)', text: '#9c27b0' },
  '宋代': { bg: 'rgba(33, 150, 243, 0.15)', text: '#2196f3' },
};

/**
 * 作品类型标签映射
 */
const workTypeLabels: Record<string, string> = {
  'prose': '散文',
  'poetry': '诗词',
  'essay': '论说文',
  'memorial': '奏疏',
};

/**
 * 学者详情弹窗组件
 * 展示学者的完整传记、成就和代表作品
 */
export function ScholarDetailModal({
  scholar,
  open,
  onClose,
}: ScholarDetailModalProps) {
  if (!scholar) return null;

  const dynasty = scholar.dynasty || scholar.dynastyPeriod || '未知朝代';
  const dynastyColor = dynastyColors[dynasty] || {
    bg: 'rgba(158, 158, 158, 0.15)',
    text: '#9e9e9e',
  };

  // Property 7: Portrait Fallback
  const hasPortrait = scholar.portraitUrl && scholar.portraitUrl.trim() !== '';
  const firstChar = scholar.name.charAt(0);

  // 获取成就列表，优先使用achievements，兼容contributions
  const achievements = scholar.achievements || scholar.contributions || [];
  
  // 获取代表作品，优先使用representativeWorks，兼容majorWorks
  const representativeWorks = scholar.representativeWorks || [];
  const majorWorks = scholar.majorWorks || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="scholar-detail-title"
      aria-describedby="scholar-detail-description"
      PaperProps={{
        sx: {
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
          maxHeight: '90vh',
        },
      }}
    >
      {/* 标题栏 */}
      <DialogTitle
        id="scholar-detail-title"
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* 头像 */}
          <Avatar
            {...(hasPortrait ? { src: scholar.portraitUrl } : {})}
            alt={scholar.name}
            sx={{
              width: 64,
              height: 64,
              backgroundColor: dynastyColor.bg,
              color: dynastyColor.text,
              fontWeight: 'bold',
              fontSize: '1.5rem',
              border: `3px solid ${dynastyColor.text}`,
            }}
          >
            {!hasPortrait && firstChar}
          </Avatar>
          
          <Box>
            <Typography
              variant="h5"
              component="span"
              sx={{
                fontWeight: 'bold',
                color: 'var(--color-text-primary)',
              }}
            >
              {scholar.name}
            </Typography>
            {scholar.name_en && (
              <Typography
                variant="body2"
                sx={{
                  color: 'var(--color-text-secondary)',
                  mt: 0.5,
                }}
              >
                {scholar.name_en}
              </Typography>
            )}
            
            {/* 标签 */}
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
              <Chip
                label={dynasty}
                size="small"
                sx={{
                  backgroundColor: dynastyColor.bg,
                  color: dynastyColor.text,
                  fontWeight: 500,
                  fontSize: '0.75rem',
                }}
              />
              {scholar.schoolOfThought && (
                <Chip
                  label={scholar.schoolOfThought}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '0.75rem',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                />
              )}
              {(scholar.birthYear && scholar.deathYear) && (
                <Chip
                  label={`${scholar.birthYear} - ${scholar.deathYear}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '0.75rem',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
        
        {/* 关闭按钮 - Requirements 4.3 */}
        <IconButton
          aria-label="关闭"
          onClick={onClose}
          sx={{ color: 'var(--color-text-secondary)' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* 内容区域 */}
      <DialogContent dividers sx={{ py: 3 }}>
        {/* 完整传记 - Requirements 4.1 */}
        {scholar.biography && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: 'var(--color-text-primary)',
                fontWeight: 600,
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              人物传记
            </Typography>
            <Typography
              id="scholar-detail-description"
              variant="body1"
              sx={{
                color: 'var(--color-text-primary)',
                lineHeight: 1.8,
                textAlign: 'justify',
              }}
            >
              {scholar.biography}
            </Typography>
          </Box>
        )}

        {scholar.biography && achievements.length > 0 && <Divider sx={{ my: 2 }} />}

        {/* 主要成就 - Requirements 4.1 */}
        {achievements.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: 'var(--color-text-primary)',
                fontWeight: 600,
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: '1.2rem', color: '#ffc107' }} />
              主要成就
            </Typography>
            <List dense disablePadding>
              {achievements.map((achievement, index) => (
                <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'var(--color-text-secondary)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1,
                        }}
                      >
                        <span style={{ color: dynastyColor.text }}>•</span>
                        {achievement}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {(achievements.length > 0 && (representativeWorks.length > 0 || majorWorks.length > 0)) && <Divider sx={{ my: 2 }} />}

        {/* 代表作品 - Requirements 4.1, 4.2 */}
        {(representativeWorks.length > 0 || majorWorks.length > 0) && (
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                color: 'var(--color-text-primary)',
                fontWeight: 600,
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <MenuBookIcon sx={{ fontSize: '1.2rem', color: '#4caf50' }} />
              代表作品
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* 详细的代表作品 */}
              {representativeWorks.map((work: LiteraryWork) => (
                <Box
                  key={work.id}
                  sx={{
                    p: 2,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {/* 作品标题和类型 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      《{work.title}》
                    </Typography>
                    <Chip
                      label={workTypeLabels[work.type] || work.type}
                      size="small"
                      sx={{
                        fontSize: '0.65rem',
                        height: '20px',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        color: '#4caf50',
                      }}
                    />
                  </Box>
                  
                  {/* 作品描述 */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--color-text-secondary)',
                      mb: work.contentExcerpt ? 1 : 0,
                    }}
                  >
                    {work.description}
                  </Typography>
                  
                  {/* 内容摘录 */}
                  {work.contentExcerpt && (
                    <Box
                      sx={{
                        mt: 1,
                        p: 1.5,
                        borderLeft: `3px solid ${dynastyColor.text}`,
                        backgroundColor: 'var(--color-bg-secondary)',
                        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'var(--color-text-primary)',
                          fontStyle: 'italic',
                          lineHeight: 1.6,
                        }}
                      >
                        "{work.contentExcerpt}"
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
              
              {/* 简单的主要作品列表 */}
              {majorWorks.map((work, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {work}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* 操作按钮 - Requirements 4.3 */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ScholarDetailModal;
