import React, { useState, useEffect } from 'react';
import {
  Chip,
  Box,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  LinearProgress,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { getApiStatus, fallbackControl } from '@/utils/services/apiClient';

/**
 * API状态指示器组件
 * 显示当前API状态、降级策略状态和熔断器状态
 */
export const ApiStatusIndicator: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 获取API状态
  const fetchApiStatus = () => {
    try {
      const status = getApiStatus();
      setApiStatus(status);
    } catch (error) {
      console.error('获取API状态失败:', error);
    }
  };

  // 定期更新状态
  useEffect(() => {
    fetchApiStatus();
    const interval = setInterval(fetchApiStatus, 5000); // 每5秒更新一次
    return () => clearInterval(interval);
  }, []);

  // 手动刷新状态
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟刷新延迟
    fetchApiStatus();
    setRefreshing(false);
  };

  // 获取状态颜色和图标
  const getStatusInfo = () => {
    if (!apiStatus) {
      return {
        color: 'default' as const,
        icon: <InfoIcon fontSize="small" />,
        label: '未知状态',
        description: '正在获取API状态...',
      };
    }

    const { fallback } = apiStatus;

    if (fallback.isActive) {
      return {
        color: 'warning' as const,
        icon: <WarningIcon fontSize="small" />,
        label: '降级模式',
        description: 'API请求失败，已自动切换到Mock数据',
      };
    }

    if (fallback.failureCount > 0) {
      return {
        color: 'error' as const,
        icon: <ErrorIcon fontSize="small" />,
        label: `API异常 (${fallback.failureCount})`,
        description: '检测到API请求失败，正在监控中',
      };
    }

    return {
      color: 'success' as const,
      icon: <CheckCircleIcon fontSize="small" />,
      label: 'API正常',
      description: 'API服务运行正常',
    };
  };

  const statusInfo = getStatusInfo();

  // 手动控制降级策略
  const handleToggleFallback = () => {
    if (apiStatus?.fallback.isActive) {
      fallbackControl.deactivate();
    } else {
      fallbackControl.activate();
    }
    fetchApiStatus();
  };

  // 重置降级状态
  const handleResetFallback = () => {
    fallbackControl.reset();
    fetchApiStatus();
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          icon={statusInfo.icon}
          label={statusInfo.label}
          color={statusInfo.color}
          variant="outlined"
          size="small"
        />

        <Tooltip title="查看API状态详情">
          <IconButton size="small" onClick={() => setOpen(true)}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="刷新状态">
          <IconButton 
            size="small" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon />
            API状态监控
          </Box>
        </DialogTitle>

        <DialogContent>
          {refreshing && <LinearProgress sx={{ mb: 2 }} />}

          {/* 当前状态 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              当前状态
            </Typography>
            <Alert severity={statusInfo.color === 'success' ? 'success' : statusInfo.color === 'warning' ? 'warning' : 'error'}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {statusInfo.icon}
                <Typography variant="body2">
                  {statusInfo.description}
                </Typography>
              </Box>
            </Alert>
          </Box>

          {apiStatus && (
            <>
              {/* 降级策略状态 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  降级策略
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={apiStatus.fallback.isActive}
                        onChange={handleToggleFallback}
                        color="warning"
                      />
                    }
                    label={apiStatus.fallback.isActive ? "降级策略已激活" : "降级策略未激活"}
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      失败次数
                    </Typography>
                    <Typography variant="h6">
                      {apiStatus.fallback.failureCount} / {apiStatus.fallback.config.fallbackThreshold}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      自动降级
                    </Typography>
                    <Typography variant="h6">
                      {apiStatus.fallback.config.enableAutoFallback ? '启用' : '禁用'}
                    </Typography>
                  </Box>
                </Box>

                {apiStatus.fallback.lastError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>最后错误:</strong> {apiStatus.fallback.lastError}
                    </Typography>
                  </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleResetFallback}
                    startIcon={<RefreshIcon />}
                  >
                    重置状态
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* 配置信息 */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  配置信息
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      降级阈值
                    </Typography>
                    <Typography variant="body1">
                      {apiStatus.fallback.config.fallbackThreshold} 次失败
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      降级持续时间
                    </Typography>
                    <Typography variant="body1">
                      {Math.round(apiStatus.fallback.config.fallbackDuration / 1000 / 60)} 分钟
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </>
          )}

          {/* 使用说明 */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              功能说明
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • <strong>自动降级:</strong> 当API连续失败达到阈值时，自动切换到Mock数据
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • <strong>熔断保护:</strong> 防止无限重试导致页面卡死
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • <strong>智能恢复:</strong> API恢复正常后自动切换回真实数据
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>手动控制:</strong> 可以手动激活/停用降级策略
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};