import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './routes';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

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