import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { routes } from './routes';

// 加载中组件
const LoadingFallback = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    height="100%"
    minHeight="200px"
  >
    <CircularProgress />
  </Box>
);

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* 根路径重定向到时间轴 */}
          <Route path="/" element={<Navigate to="/timeline" replace />} />
          {routes.map((route) => (
            <Route
              key={route.key}
              path={route.path}
              element={<route.component />}
            />
          ))}
          {/* 其他未匹配路径重定向到时间轴 */}
          <Route path="*" element={<Navigate to="/timeline" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}