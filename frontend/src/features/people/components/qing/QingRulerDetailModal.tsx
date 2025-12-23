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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PolicyIcon from '@mui/icons-material/Policy';
import HistoryIcon from '@mui/icons-material/History';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import type { QingRuler } from '@/services/people/qing/types';
import { qingRulerService } from '@/services/people/qing';

interface QingRulerDetailModalProps {
  ruler: QingRuler | null;
  open: boolean;
  onClose: () => void;
}

/**
 * 清朝时期颜色映射
 */
const periodColors: Record<string, { bg: string; text: string }> = {
  '清初（1616-1722）': { bg: 'rgba(255, 235, 59, 0.15)', text: '#F9A825' },
  '盛清（1723-1795）': { bg: 'rgba(255, 193, 7, 0.15)', text: '#FFA000' },
  '清中期（1796-1861）': { bg: 'rgba(255, 152, 0, 0.15)', text: '#FF9800' },
  '晚清（1862-1912）': { bg: 'rgba(121, 85, 72, 0.15)', text: '#795548' },
};

/**
 * 清朝统治者详情弹窗组件
 */
export function QingRulerDetailModal({
  ruler,
  open,
  onClose,
}: QingRulerDetailModalProps) {
  if (!ruler) return null;

  // 根据在位时间确定时期
  const getPeriod = (reignStart: number): string => {
    if (reignStart >= 1616 && reignStart <= 1722) return '清初（1616-1722）';
    if (reignStart >= 1723 && reignStart <= 1795) return '盛清（1723-1795）';
    if (reignStart >= 1796 && reignStart <= 1861) return '清中期（1796-1861）';
    if (reignStart >= 1862 && reignStart <= 1912) return '晚清（1862-1912）';
    return '其他';
  };

  const period = getPeriod(ruler.reignStart);
  const periodColor = periodColors[period] || {
    bg: 'rgba(158, 158, 158, 0.15)',
    text: '#9e9e9e',
  };

  const hasPortrait = ruler.portraitUrl && ruler.portraitUrl.trim() !== '';
  const firstChar = ruler.name.charAt(0);
  const reignPeriod = qingRulerService.formatReignPeriod(ruler);
  const reignYears = qingRulerService.calculateReignYears(ruler);
  const title = qingRulerService.getTitle(ruler);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="qing-ruler-detail-title"
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
        id="qing-ruler-detail-title"
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            {...(hasPortrait ? { src: ruler.portraitUrl } : {})}
            alt={ruler.name}
            sx={{
              width: 72,
              height: 72,
              backgroundColor: periodColor.bg,
              color: periodColor.text,
              fontWeight: 'bold',
              fontSize: '2rem',
              border: `3px solid ${periodColor.text}`,
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
              {ruler.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--color-text-secondary)',
                mt: 0.5,
              }}
            >
              {title}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
              <Chip
                label={period}
                size="small"
                sx={{
                  backgroundColor: periodColor.bg,
                  color: periodColor.text,
                  fontWeight: 500,
                }}
              />
              <Chip
                label={`在位${reignYears}年`}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              />
            </Box>
          </Box>
        </Box>
        
        <IconButton
          aria-label="关闭"
          onClick={onClose}
          sx={{ color: 'var(--color-text-secondary)' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

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
                sx={{
                  color: 'var(--color-text-primary)',
                  fontWeight: 600,
                  mb: 1.5,
                }}
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

        {/* 政治举措 - Requirements 4.3 */}
        {ruler.policies.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
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
                <PolicyIcon sx={{ fontSize: '1.2rem', color: '#2196f3' }} />
                政治举措
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {ruler.policies.map((policy, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg-tertiary)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {policy.name}
                      </Typography>
                      {policy.year && (
                        <Chip
                          label={`${policy.year}年`}
                          size="small"
                          sx={{
                            fontSize: '0.7rem',
                            height: '20px',
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            color: '#2196f3',
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'var(--color-text-secondary)',
                        mb: 1,
                      }}
                    >
                      {policy.description}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'var(--color-text-primary)',
                        fontWeight: 500,
                      }}
                    >
                      影响：{policy.impact}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        )}

        {/* 重大历史事件 - Requirements 4.4 */}
        {ruler.majorEvents.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
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
                <HistoryIcon sx={{ fontSize: '1.2rem', color: '#ff9800' }} />
                重大历史事件
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {ruler.majorEvents.map((event, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg-tertiary)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {event.name}
                      </Typography>
                      <Chip
                        label={`${event.year}年`}
                        size="small"
                        sx={{
                          fontSize: '0.7rem',
                          height: '20px',
                          backgroundColor: 'rgba(255, 152, 0, 0.1)',
                          color: '#ff9800',
                        }}
                      />
                      <Chip
                        label={event.role}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.7rem',
                          height: '20px',
                          borderColor: periodColor.text,
                          color: periodColor.text,
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {event.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        )}

        {/* 对清朝兴衰的贡献与责任 - Requirements 4.5 */}
        <Divider sx={{ my: 2 }} />
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
            <TrendingUpIcon sx={{ fontSize: '1.2rem', color: '#4caf50' }} />
            对清朝兴衰的贡献
          </Typography>
          <Box
            sx={{
              p: 2,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-tertiary)',
              borderLeft: `3px solid #4caf50`,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: 'var(--color-text-primary)',
                lineHeight: 1.8,
              }}
            >
              {ruler.contribution}
            </Typography>
          </Box>
        </Box>

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
            <TrendingDownIcon sx={{ fontSize: '1.2rem', color: '#f44336' }} />
            对清朝兴衰的责任
          </Typography>
          <Box
            sx={{
              p: 2,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-tertiary)',
              borderLeft: `3px solid #f44336`,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: 'var(--color-text-primary)',
                lineHeight: 1.8,
              }}
            >
              {ruler.responsibility}
            </Typography>
          </Box>
        </Box>

        {/* 历史评价 */}
        {ruler.evaluations.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
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
                <MenuBookIcon sx={{ fontSize: '1.2rem', color: '#9c27b0' }} />
                历史评价
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {ruler.evaluations.map((evaluation, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg-tertiary)',
                      borderLeft: `3px solid ${periodColor.text}`,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'var(--color-text-primary)',
                        fontStyle: 'italic',
                        lineHeight: 1.8,
                        mb: 1,
                      }}
                    >
                      "{evaluation.content}"
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      —— {evaluation.source}
                      {evaluation.author && ` · ${evaluation.author}`}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        )}

        {/* 参考资料 */}
        {ruler.sources.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'var(--color-text-secondary)',
                  mb: 1,
                }}
              >
                参考资料
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.8rem',
                }}
              >
                {ruler.sources.join('、')}
              </Typography>
            </Box>
          </>
        )}
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
