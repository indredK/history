/**
 * 思想流派详情弹窗组件
 * School Detail Modal Component
 * 
 * 显示思想流派完整信息：描述、核心思想、代表人物、经典著作、历史影响
 * 支持关闭按钮、Escape键关闭、点击外部关闭
 * 
 * Requirements: 4.1, 4.2, 4.3
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
  ListItemAvatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import type { PhilosophicalSchool } from '@/services/schools/types';

interface SchoolDetailProps {
  school: PhilosophicalSchool | null;
  open: boolean;
  onClose: () => void;
}

/**
 * 思想流派详情弹窗组件
 * 展示流派的完整描述、核心思想、代表人物、经典著作、历史影响
 */
export function SchoolDetail({
  school,
  open,
  onClose,
}: SchoolDetailProps) {
  if (!school) return null;

  const firstChar = school.name.charAt(0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="school-detail-title"
      aria-describedby="school-detail-description"
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
        id="school-detail-title"
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* 流派图标 */}
          <Avatar
            alt={school.name}
            sx={{
              width: 64,
              height: 64,
              backgroundColor: school.color || 'var(--color-primary)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '1.5rem',
            }}
          >
            {firstChar}
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
              {school.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--color-text-secondary)',
                mt: 0.5,
              }}
            >
              {school.name_en}
            </Typography>
            
            {/* 标签 */}
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`创始人: ${school.founder}`}
                size="small"
                sx={{
                  backgroundColor: `${school.color}20` || 'rgba(158, 158, 158, 0.15)',
                  color: school.color || 'var(--color-text-secondary)',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                }}
              />
              <Chip
                label={school.foundingPeriod}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.75rem',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              />
            </Box>
          </Box>
        </Box>
        
        {/* 关闭按钮 */}
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
        {/* 完整描述 */}
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
            流派简介
          </Typography>
          <Typography
            id="school-detail-description"
            variant="body1"
            sx={{
              color: 'var(--color-text-primary)',
              lineHeight: 1.8,
              textAlign: 'justify',
            }}
          >
            {school.description}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 核心思想 */}
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
            <LightbulbIcon sx={{ fontSize: '1.2rem', color: '#ffc107' }} />
            核心思想
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {school.coreIdeas.map((idea, index) => (
              <Chip
                key={index}
                label={idea}
                sx={{
                  backgroundColor: `${school.color}15` || 'rgba(158, 158, 158, 0.1)',
                  color: school.color || 'var(--color-text-primary)',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  border: `1px solid ${school.color}40` || 'var(--color-border)',
                }}
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 代表人物 */}
        {school.representativeFigures && school.representativeFigures.length > 0 && (
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
              <PersonIcon sx={{ fontSize: '1.2rem', color: '#2196f3' }} />
              代表人物
            </Typography>
            <List dense disablePadding>
              {school.representativeFigures.map((figure) => (
                <ListItem
                  key={figure.id}
                  sx={{
                    py: 1,
                    px: 2,
                    mb: 1,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        backgroundColor: school.color || 'var(--color-primary)',
                        color: '#fff',
                        width: 36,
                        height: 36,
                        fontSize: '0.9rem',
                      }}
                    >
                      {figure.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}
                        >
                          {figure.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'var(--color-text-secondary)' }}
                        >
                          {figure.name_en}
                        </Typography>
                        <Chip
                          label={figure.period}
                          size="small"
                          sx={{
                            fontSize: '0.65rem',
                            height: '18px',
                            backgroundColor: 'var(--color-bg-secondary)',
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{ color: 'var(--color-text-secondary)', mt: 0.5 }}
                      >
                        {figure.contribution}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* 经典著作 */}
        {school.classicWorks && school.classicWorks.length > 0 && (
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
              <MenuBookIcon sx={{ fontSize: '1.2rem', color: '#4caf50' }} />
              经典著作
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {school.classicWorks.map((work) => (
                <Box
                  key={work.id}
                  sx={{
                    p: 2,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {/* 作品标题 */}
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
                    <Typography
                      variant="caption"
                      sx={{ color: 'var(--color-text-secondary)' }}
                    >
                      {work.title_en}
                    </Typography>
                  </Box>
                  
                  {/* 作者 */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: school.color || 'var(--color-primary)',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    作者: {work.author}
                  </Typography>
                  
                  {/* 作品描述 */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {work.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* 历史影响 */}
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
            <HistoryEduIcon sx={{ fontSize: '1.2rem', color: '#9c27b0' }} />
            历史影响
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'var(--color-text-primary)',
              lineHeight: 1.8,
              textAlign: 'justify',
            }}
          >
            {school.influence}
          </Typography>
        </Box>
      </DialogContent>

      {/* 操作按钮 */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SchoolDetail;
