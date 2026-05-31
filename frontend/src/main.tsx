import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AppProviders } from './components/AppProviders.tsx'
import { initializeStyle, initializeTheme } from './store'
import './index.scss'
import './styles/ui.scss'
import 'animate.css'

console.info(
  `%c${__APP_NAME__}%c release %c${__APP_RELEASE_ID__}`,
  'background:#111827;color:#f9fafb;padding:2px 6px;border-radius:4px 0 0 4px;font-weight:600;',
  'background:#1f2937;color:#d1d5db;padding:2px 6px;',
  'background:#2563eb;color:#eff6ff;padding:2px 6px;border-radius:0 4px 4px 0;font-weight:600;',
)
console.info('Build info', {
  version: __APP_VERSION__,
  commit: __APP_COMMIT_SHA__,
  builtAt: __APP_BUILD_TIME__,
  basePath: import.meta.env.VITE_BASE_PATH || '/',
  dataSource: import.meta.env.VITE_DATA_SOURCE || 'mock',
})

// 获取基础路径，通过环境变量控制
// 自有服务器: VITE_BASE_PATH='/' 
// GitHub Pages: VITE_BASE_PATH='/history'
const basename = import.meta.env.VITE_BASE_PATH || '/'

initializeTheme()
initializeStyle()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </AppProviders>
  </React.StrictMode>,
)
