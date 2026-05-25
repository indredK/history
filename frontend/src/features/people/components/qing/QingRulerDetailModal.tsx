/**
 * 清朝统治者详情弹窗组件
 * Qing Ruler Detail Modal Component
 *
 * 显示清朝统治者完整信息：政策、事件、贡献、责任
 *
 * Requirements: 4.3, 4.4, 4.5, 4.6
 */

import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import type { QingRuler } from '@/services/person/qing/types';
import { qingRulerService } from '@/services/person/qing';
import { DEFAULT_PERIOD_COLOR, PERIOD_COLORS, getPeriod } from './parts/period';
import { QingHeader } from './parts/QingHeader';
import { QingPoliciesSection } from './parts/QingPoliciesSection';
import { QingEventsSection } from './parts/QingEventsSection';
import { QingContributionResponsibilitySection } from './parts/QingContributionResponsibilitySection';
import { QingEvaluationsSection } from './parts/QingEvaluationsSection';
import { QingSourcesSection } from './parts/QingSourcesSection';

interface QingRulerDetailModalProps {
  ruler: QingRuler | null;
  open: boolean;
  onClose: () => void;
}

/**
 * 清朝统治者详情弹窗组件
 */
export function QingRulerDetailModal({ ruler, open, onClose }: QingRulerDetailModalProps) {
  // hooks 在条件返回之前调用——这里没有 hook，可以直接早返回
  if (!ruler) return null;

  const period = getPeriod(ruler.reignStart);
  const periodColor = PERIOD_COLORS[period] || DEFAULT_PERIOD_COLOR;
  const reignPeriod = qingRulerService.formatReignPeriod(ruler);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="qing-ruler-detail-title"
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
      <QingHeader ruler={ruler} onClose={onClose} />

      <DialogContent dividers sx={{ py: 3 }}>
        {/* 在位时间 */}
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
            <CalendarTodayIcon sx={{ fontSize: '1.2rem', color: periodColor.text }} />
            在位时间
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--color-text-primary)' }}>
            {reignPeriod}（年号：{ruler.eraName}）
          </Typography>
        </Box>

        {/* 简介 */}
        {ruler.biography && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{ color: 'var(--color-text-primary)', fontWeight: 600, mb: 1.5 }}
              >
                人物简介
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.8,
                  textAlign: 'justify',
                }}
              >
                {ruler.biography}
              </Typography>
            </Box>
          </>
        )}

        <QingPoliciesSection policies={ruler.policies} />
        <QingEventsSection events={ruler.majorEvents} periodColor={periodColor} />
        <QingContributionResponsibilitySection
          contribution={ruler.contribution}
          responsibility={ruler.responsibility}
        />
        <QingEvaluationsSection evaluations={ruler.evaluations} periodColor={periodColor} />
        <QingSourcesSection sources={ruler.sources} />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default QingRulerDetailModal;
