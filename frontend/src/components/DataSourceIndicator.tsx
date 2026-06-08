import React, { useState, useEffect } from 'react';
import { Box, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Alert } from '@mui/material';
import { Refresh as RefreshIcon, Science as ScienceIcon, Cloud as CloudIcon } from '@mui/icons-material';
import { getDataSourceInfo, DATA_SOURCE_MODE, DATA_SOURCE_CONFIG } from '@/config/dataSource';
import {
  testApiConnection,
  testAllApiEndpoints,
  testFrontendProxy,
  type AllEndpointsResult,
  type EndpointTestResult,
  type TestResult,
} from '@/utils/apiTest';
import { useResponsive } from '@/hooks';
import { getGlassConfig } from '@/config/glassConfig';

interface DataSourceIndicatorProps {
  /** 是否为折叠状态 */
  collapsed?: boolean;
}

type DataSourceTestResults = {
  success: boolean;
  message: string;
  details?: {
    mode: 'mock';
    delay: number;
    description: string;
  };
  proxyTest?: TestResult;
  connectionTest?: TestResult;
  endpointTests?: AllEndpointsResult | null;
};

/**
 * 数据源状态指示器组件
 * 显示当前使用的数据源，并提供测试功能
 */
export const DataSourceIndicator: React.FC<DataSourceIndicatorProps> = ({ collapsed = false }) => {
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<DataSourceTestResults | null>(null);

  const { screenWidth } = useResponsive();
  const glassConfig = getGlassConfig(screenWidth);

  const dataSourceInfo = getDataSourceInfo();
  const isMockMode = dataSourceInfo.mode === 'mock';

  // 与设置面板其他按钮保持一致的尺寸
  const buttonSize = collapsed ? 32 : 40;

  // 毛玻璃按钮样式
  const buttonStyle = {
    backdropFilter: 'var(--app-backdrop-light)',
    WebkitBackdropFilter: 'var(--app-backdrop-light)',
    background: 'var(--app-interactive-bg-soft)',
    border: '1px solid var(--app-interactive-border)',
    borderRadius: glassConfig.border.radius.md,
    color: 'var(--app-interactive-text)',
    width: buttonSize,
    height: buttonSize,
    minWidth: buttonSize,
    transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`,
    '&:hover': {
      background: 'var(--app-interactive-hover-bg)',
      boxShadow: 'var(--app-panel-shadow-sm)',
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(-1px) scale(0.92)',
    },
  };

  const label = isMockMode ? '模拟数据' : '真实API';

  /**
   * 关闭弹窗时同时清理本次测试结果与 testing 标志,
   * 避免下次打开看到上次会话的陈旧结果(§6.2)。
   */
  const handleClose = () => {
    setOpen(false);
    setTestResults(null);
    setTesting(false);
  };
  
  // 测试API连接
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResults(null);
    
    try {
      if (isMockMode) {
        // Mock模式下的测试
        setTestResults({
          success: true,
          message: '✅ Mock数据源正常工作',
          details: {
            mode: 'mock',
            delay: DATA_SOURCE_CONFIG.mock.delay,
            description: '使用本地JSON文件作为数据源',
          },
        });
      } else {
        // API模式下的测试

        // 1. 测试前端代理
        const proxyTest = await testFrontendProxy();

        // 2. 测试直接API连接
        const connectionTest = await testApiConnection();

        // 3. 测试所有端点
        let endpointTests = null;
        if (proxyTest.success || connectionTest.success) {
          endpointTests = await testAllApiEndpoints();
        }
        
        setTestResults({
          proxyTest,
          connectionTest,
          endpointTests,
          success: proxyTest.success || connectionTest.success,
          message: proxyTest.success 
            ? '✅ 前端代理和API连接正常' 
            : connectionTest.success 
              ? '✅ 直接API连接正常，但代理可能有问题'
              : '❌ API连接失败',
        });
      }
    } catch (error) {
      console.error('测试过程中出错:', error);
      setTestResults({
        success: false,
        message: `❌ 测试失败: ${error instanceof Error ? error.message : '未知错误'}`,
      });
    } finally {
      setTesting(false);
    }
  };
  
  // 自动测试（仅在API模式下）
  useEffect(() => {
    if (!isMockMode) {
      handleTestConnection();
    }
  }, [isMockMode]);
  
  return (
    <>
      <Tooltip title={`数据源：${label}（点击查看详情）`} placement={collapsed ? 'right' : 'top'}>
        <IconButton
          onClick={() => setOpen(true)}
          sx={buttonStyle}
          aria-label={`数据源：${label}`}
        >
          {isMockMode ? <ScienceIcon fontSize="small" /> : <CloudIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
      
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          📊 数据源配置信息
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              当前配置
            </Typography>
            <Alert severity={isMockMode ? 'warning' : 'success'} sx={{ mb: 2 }}>
              <strong>数据源模式:</strong> {dataSourceInfo.description}
            </Alert>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>配置位置:</strong> <code>frontend/.env</code>（变量 <code>VITE_DATA_SOURCE</code>）
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>当前开关值:</strong> <code>DATA_SOURCE_MODE = {DATA_SOURCE_MODE}</code>
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>切换方法:</strong>
              <br />• 设置 <code>VITE_DATA_SOURCE=mock</code>（或 <code>json</code>）使用模拟数据
              <br />• 设置 <code>VITE_DATA_SOURCE=api</code> 使用真实API
              <br />• 修改后需要重启前端服务器
            </Typography>
          </Box>
          
          {!isMockMode && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                API连接测试
              </Typography>
              
              <Button
                variant="outlined"
                onClick={handleTestConnection}
                disabled={testing}
                startIcon={<RefreshIcon />}
                sx={{ mb: 2 }}
              >
                {testing ? '测试中...' : '重新测试'}
              </Button>
              
              {testResults && (
                <Box>
                  <Alert 
                    severity={testResults.success ? 'success' : 'error'}
                    sx={{ mb: 2 }}
                  >
                    {testResults.message}
                  </Alert>
                  
                  {/* 代理测试结果 */}
                  {testResults.proxyTest && (
                    <Alert
                      severity={testResults.proxyTest.success ? 'success' : 'warning'}
                      sx={{ mb: 1 }}
                    >
                      <strong>前端代理:</strong> {testResults.proxyTest.message}
                    </Alert>
                  )}
                  
                  {/* 直接连接测试结果 */}
                  {testResults.connectionTest && (
                    <Alert
                      severity={testResults.connectionTest.success ? 'success' : 'error'}
                      sx={{ mb: 1 }}
                    >
                      <strong>直接连接:</strong> {testResults.connectionTest.message}
                    </Alert>
                  )}
                  
                  {/* 端点测试结果 */}
                  {testResults.endpointTests && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        API端点测试结果:
                      </Typography>
                      {testResults.endpointTests.results.map((result: EndpointTestResult, index: number) => (
                        <Alert
                          key={index}
                          severity={result.success ? 'success' : 'error'}
                          sx={{ mb: 1 }}
                        >
                          <strong>{result.endpoint}:</strong> {result.message}
                        </Alert>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
          
          {isMockMode && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Mock数据配置
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 数据来源: <code>/data/json/*.json</code>
                <br />• 模拟延迟: <code>{DATA_SOURCE_CONFIG.mock.delay}ms</code>
                <br />• 错误率: <code>{DATA_SOURCE_CONFIG.mock.errorRate * 100}%</code>
              </Typography>
            </Box>
          )}

          {/* 新增：错误处理说明 */}
          {!isMockMode && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                错误处理机制
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>自动重试:</strong> 网络错误和服务器错误会自动重试最多3次
                <br />• <strong>熔断保护:</strong> 连续5次失败后暂停请求30秒，防止页面卡死
                <br />• <strong>自动降级:</strong> 连续3次失败后自动切换到Mock数据
                <br />• <strong>智能恢复:</strong> API恢复正常后自动切换回真实数据
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
