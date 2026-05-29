import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './routes';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { MapFirstLayout } from '@/layouts/map-first/MapFirstLayout';

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
    <Suspense fallback={<LoadingSkeleton variant="page" />}>
      <Routes>
        <Route path="/" element={<Navigate to="/map" replace />} />
        <Route path="/" element={<MapFirstLayout routes={routes} />}>
          {routes.map((route) => (
            <Route
              key={route.key}
              path={route.path.slice(1)}
              element={
                <ErrorBoundary>
                  <route.component />
                </ErrorBoundary>
              }
            />
          ))}
        </Route>
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
  );
}
