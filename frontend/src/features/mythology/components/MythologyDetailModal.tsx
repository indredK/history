/**
 * 神话详情弹窗组件
 * Mythology Detail Modal Component
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { Mythology } from '@/services/mythology';

interface MythologyDetailModalProps {
  mythology: Mythology | null;
  open: boolean;
  onClose: () => void;
}

/**
 * 分类颜色映射
 */
const categoryColors: Record<string, { bg: string; text: string }> = {
  '创世神话': { bg: 'rgba(156, 39, 176, 0.15)', text: '#9c27b0' },
  '英雄神话': { bg: 'rgba(244, 67, 54, 0.15)', text: '#f44336' },
  '自然神话': { bg: 'rgba(76, 175, 80, 0.15)', text: '#4caf50' },
  '爱情神话': { bg: 'rgba(233, 30, 99, 0.15)', text: '#e91e63' },
};

/**
 * 神话详情弹窗组件
 * 显示完整的神话故事内容
 */
export function MythologyDetailModal({
  mythology,
  open,
  onClose,
}: MythologyDetailModalProps) {
  if (!mythology) return null;

  const categoryColor = categoryColors[mythology.category] || {
    bg: 'rgba(158, 158, 158, 0.15)',
    text: '#9e9e9e',
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="mythology-detail-title"
      aria-describedby="mythology-detail-description"
      PaperProps={{
        sx: {
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
        },
      }}
    >
      {/* 标题栏 */}
      <DialogTitle
        id="mythology-detail-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            component="span"
            sx={{
              fontWeight: 'bold',
              color: 'var(--color-text-primary)',
            }}
          >
            {mythology.title}
          </Typography>
          {mythology.englishTitle && (
            <Typography
              variant="body2"
              sx={{
                color: 'var(--color-text-secondary)',
                mt: 0.5,
              }}
            >
              {mythology.englishTitle}
            </Typography>
          )}
        </Box>
        <IconButton
          aria-label="关闭"
          onClick={onClose}
          sx={{ color: 'var(--color-text-secondary)' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* 内容区域 */}
      <DialogContent dividers>
        {/* 分类标签 */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={mythology.category}
            size="small"
            sx={{
              backgroundColor: categoryColor.bg,
              color: categoryColor.text,
              fontWeight: 500,
            }}
          />
        </Box>

        {/* 完整描述 */}
        <Typography
          id="mythology-detail-description"
          variant="body1"
          sx={{
            color: 'var(--color-text-primary)',
            lineHeight: 1.8,
            mb: 3,
            textAlign: 'justify',
          }}
        >
          {mythology.description}
        </Typography>

        {/* 相关人物 */}
        {mythology.characters && mythology.characters.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: 'var(--color-text-secondary)',
                mb: 1,
                fontWeight: 600,
              }}
            >
              相关人物
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {mythology.characters.map((character, index) => (
                <Chip
                  key={index}
                  label={character}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* 出处 */}
        {mythology.source && (
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                color: 'var(--color-text-secondary)',
                mb: 0.5,
                fontWeight: 600,
              }}
            >
              出处
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--color-text-secondary)',
                fontStyle: 'italic',
              }}
            >
              {mythology.source}
            </Typography>
          </Box>
        )}
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

export default MythologyDetailModal;
