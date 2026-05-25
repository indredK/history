/**
 * 思想流派详情弹窗组件
 * School Detail Modal Component
 *
 * 显示思想流派完整信息:描述、核心思想、代表人物、经典著作、历史影响
 * 支持关闭按钮、Escape 键关闭、点击外部关闭
 *
 * Requirements: 4.1, 4.2, 4.3
 */

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Typography,
} from '@mui/material';
import type { PhilosophicalSchool } from '@/services/school/types';
import { SchoolHeader } from './SchoolHeader';
import { SchoolCoreBeliefs } from './SchoolCoreBeliefs';
import { SchoolFigures } from './SchoolFigures';
import { SchoolWorks } from './SchoolWorks';
import { SchoolInfluence } from './SchoolInfluence';

interface SchoolDetailProps {
  school: PhilosophicalSchool | null;
  open: boolean;
  onClose: () => void;
}

export function SchoolDetail({ school, open, onClose }: SchoolDetailProps) {
  if (!school) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="school-detail-title"
      aria-describedby="school-detail-description"
      slotProps={{
        paper: {
          sx: {
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            maxHeight: '90vh',
          },
        },
      }}
    >
      <SchoolHeader school={school} onClose={onClose} />

      <DialogContent dividers sx={{ py: 3 }}>
        {/* 简介 */}
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
        <SchoolCoreBeliefs school={school} />

        <Divider sx={{ my: 2 }} />
        <SchoolFigures school={school} />

        <Divider sx={{ my: 2 }} />
        <SchoolWorks school={school} />

        <Divider sx={{ my: 2 }} />
        <SchoolInfluence influence={school.influence} />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SchoolDetail;
