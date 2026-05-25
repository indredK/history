import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './routes';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

/**
 * 路由级 ErrorBoundary：单个页面崩溃不会拖垮整个应用，
 * 其他路由仍然可用。
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSkeleton variant="page" />}>
        <Routes>
          {/* 根路径重定向到时间轴 */}
          <Route path="/" element={<Navigate to="/timeline" replace />} />
          {routes.map((route) => (
            <Route
              key={route.key}
              path={route.path}
              element={
                <ErrorBoundary>
                  <route.component />
                </ErrorBoundary>
              }
            />
          ))}
          {/* 其他未匹配路径重定向到时间轴 */}
          <Route path="*" element={<Navigate to="/timeline" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
