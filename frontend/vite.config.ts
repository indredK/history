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
    // 使用 esbuild 进行压缩（默认且稳定）
    minify: 'esbuild',
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 生成 source map（可选，生产环境可关闭）
    sourcemap: mode === 'development',
    // 设置 chunk 大小限制
    chunkSizeWarningLimit: 1000,
    // 确保模块格式兼容性
    target: 'es2020',
    // 使用保守的代码分割策略，只分离大的第三方库
    rollupOptions: {
      output: {
        // 保守的代码分割 - 只分离最大的库，保持 React 完整
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // 地图相关的大库单独分离
            if (id.includes('deck.gl') || id.includes('@deck.gl') || 
                id.includes('maplibre-gl') || id.includes('react-map-gl')) {
              return 'map-libs';
            }
            // 3D 库单独分离
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-libs';
            }
            // 图表库单独分离
            if (id.includes('echarts') || id.includes('d3')) {
              return 'chart-libs';
            }
            // MUI 库分离
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'ui-libs';
            }
            // 其他所有库（包括 React）保持在默认 vendor chunk 中
            return 'vendor';
          }
        },
        // 文件命名策略
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name || '')) {
            return `assets/media/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i.test(assetInfo.name || '')) {
            return `assets/img/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name || '')) {
            return `assets/fonts/[name]-[hash].${ext}`;
          }
          return `assets/[ext]/[name]-[hash].${ext}`;
        },
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
