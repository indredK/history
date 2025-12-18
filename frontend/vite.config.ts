import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
  // GitHub Pages 部署配置
  base: process.env.NODE_ENV === 'production' ? '/history/' : '/',
  plugins: [
    react({
      // 生产环境移除 React DevTools
      babel: {
        plugins: command === 'build' ? [
          ['babel-plugin-react-remove-properties', { properties: ['data-testid'] }]
        ] : []
      },
      // 确保 JSX 运行时稳定性
      jsxRuntime: 'automatic'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@config': path.resolve(__dirname, './src/config'),
    },
  },
  server: {
    port: Number(env.VITE_DEV_PORT) || 5173,
    host: true,
    proxy: {
      '/api': {
        target: env.VITE_API_BASE_URL || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@mui/material',
      '@mui/icons-material',
      'react-router-dom',
      'zustand',
      'ahooks'
    ],
    // 强制预构建，确保依赖关系正确
    force: true,
    // 排除可能有问题的包
    exclude: []
  },
  build: {
    // 简化构建配置，不做代码分割
    minify: 'esbuild',
    target: 'es2020',
    sourcemap: false,
    // 禁用代码分割，所有代码打包到一个文件
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  // 环境变量处理
  define: {
    'import.meta.env.VITE_DATA_SOURCE': JSON.stringify(env.VITE_DATA_SOURCE || 'mock'),
    'import.meta.env.VITE_MOCK_ERROR_RATE': JSON.stringify(env.VITE_MOCK_ERROR_RATE || '0'),
    // 移除生产环境的调试信息
    __DEV__: mode === 'development',
  },
  
  // 预览服务器配置
  preview: {
    port: 4173,
    host: true,
  },
  
  // CSS 预处理器配置
  css: {
    devSourcemap: mode === 'development'
  },
}
})
