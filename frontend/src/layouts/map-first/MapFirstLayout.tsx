import { useMemo } from 'react';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { RouteConfig } from '@/router/routes';
import { useStyleStore, useThemeStore } from '@/store';
import './MapFirstLayout.scss';

interface MapFirstLayoutProps {
  routes: RouteConfig[];
}

// 动态使用所有路由作为导航项，避免新增模块时遗漏
const PRIMARY_NAV_KEYS = ['map', 'people', 'mythology', 'culture', 'dynasties', 'timeline', 'emperors-cyber'];

function routeMatches(pathname: string, routePath: string) {
  return pathname === routePath || pathname.startsWith(`${routePath}/`);
}

export function MapFirstLayout({ routes }: MapFirstLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { style, toggleStyle } = useStyleStore();

  const primaryRoutes = useMemo(
    () =>
      PRIMARY_NAV_KEYS.map((key) => routes.find((route) => route.key === key)).filter(
        (route): route is RouteConfig => Boolean(route),
      ),
    [routes],
  );

  const activeRoute = useMemo(
    () => routes.find((route) => routeMatches(location.pathname, route.path)) ?? routes[0] ?? null,
    [location.pathname, routes],
  );
  const isMapRoute = activeRoute?.key === 'map';

  return (
    <div className="map-first-layout">
      <header className="map-first-layout__topbar">
        <button type="button" className="map-first-layout__brand" onClick={() => navigate('/map')}>
          <span className="map-first-layout__brand-title">历史大地图</span>
        </button>

        <nav className="map-first-layout__nav" aria-label="主模块导航">
          {primaryRoutes.map((route) => {
            const active = activeRoute?.key === route.key;
            return (
              <button
                key={route.key}
                type="button"
                className={`map-first-layout__nav-pill${active ? ' is-active' : ''}`}
                onClick={() => navigate(route.path)}
              >
                {route.label}
              </button>
            );
          })}
        </nav>

        <div className="map-first-layout__tools">
          <button
            type="button"
            className="map-first-layout__tool-button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
            title={theme === 'dark' ? '浅色模式' : '深色模式'}
          >
            {theme === 'dark' ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
          </button>
          <button
            type="button"
            className="map-first-layout__tool-button"
            onClick={toggleStyle}
            aria-label={style === 'glass' ? '切换为经典样式' : '切换为玻璃样式'}
            title={style === 'glass' ? '经典样式' : '玻璃样式'}
          >
            {style === 'glass' ? <DashboardCustomizeRoundedIcon fontSize="small" /> : <AutoAwesomeRoundedIcon fontSize="small" />}
          </button>
        </div>
      </header>

      <main className="map-first-layout__stage">
        <div
          className={`map-first-layout__route-content${
            isMapRoute ? ' map-first-layout__route-content--map' : ' map-first-layout__route-content--page'
          }`}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
