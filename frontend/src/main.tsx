import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import './styles/ui.css'
import 'animate.css'

// 获取基础路径，通过环境变量控制
// 自有服务器: VITE_BASE_PATH='/' 
// GitHub Pages: VITE_BASE_PATH='/history'
const basename = import.meta.env.VITE_BASE_PATH || '/'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
