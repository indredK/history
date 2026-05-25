import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './routes';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// 404 页同样走懒加载,首屏不必下载
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

/**
 * 路由级 ErrorBoundary：单个页面崩溃不会拖垮整个应用，
 * 其他路由仍然可用。
 *
 * 未匹配路径渲染 404 页(而非静默重定向到时间轴),
 * 用户能清楚知道"路径不存在"而不是"被悄悄换页"。
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
          {/* 未匹配路径渲染 404 */}
          <Route
            path="*"
            element={
              <ErrorBoundary>
                <NotFoundPage />
              </ErrorBoundary>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
