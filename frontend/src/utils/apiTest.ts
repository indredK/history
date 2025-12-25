/**
 * API连接测试工具
 * 用于验证前后端接口是否正常连通
 */

import { DATA_SOURCE_CONFIG } from '@/config/dataSource';

/**
 * 测试后端API连接
 */
export async function testApiConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const baseURL = DATA_SOURCE_CONFIG.api.baseURL;
    const healthUrl = `${baseURL}/health`;
    
    console.log(`🔍 测试API连接: ${healthUrl}`);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 检查后端响应格式
    if (data.success && data.data) {
      return {
        success: true,
        message: '✅ API连接成功',
        details: {
          status: response.status,
          data: data.data,
          url: healthUrl,
          backendResponse: data,
        },
      };
    } else {
      throw new Error('后端响应格式不正确');
    }
  } catch (error) {
    return {
      success: false,
      message: `❌ API连接失败: ${error instanceof Error ? error.message : '未知错误'}`,
      details: {
        error: error instanceof Error ? error.message : error,
        url: `${DATA_SOURCE_CONFIG.api.baseURL}/health`,
      },
    };
  }
}

/**
 * 测试具体的API端点
 */
export async function testApiEndpoint(endpoint: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}> {
  try {
    const baseURL = DATA_SOURCE_CONFIG.api.baseURL;
    const fullUrl = `${baseURL}${endpoint}`;
    
    console.log(`🔍 测试API端点: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 检查后端响应格式
    if (data.success) {
      return {
        success: true,
        message: `✅ ${endpoint} 接口正常`,
        data: data.data,
      };
    } else {
      throw new Error(data.message || '后端返回错误');
    }
  } catch (error) {
    return {
      success: false,
      message: `❌ ${endpoint} 接口失败`,
      error: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * 批量测试所有主要API端点
 */
export async function testAllApiEndpoints(): Promise<{
  success: boolean;
  results: Array<{
    endpoint: string;
    success: boolean;
    message: string;
    data?: any;
    error?: any;
  }>;
}> {
  const endpoints = [
    '/health',
    '/dynasties',
    '/persons',
    '/events',
    '/emperors',
  ];
  
  const results = [];
  let allSuccess = true;
  
  for (const endpoint of endpoints) {
    const result = await testApiEndpoint(endpoint);
    results.push({
      endpoint,
      ...result,
    });
    
    if (!result.success) {
      allSuccess = false;
    }
  }
  
  return {
    success: allSuccess,
    results,
  };
}

/**
 * 测试前端代理是否工作
 */
export async function testFrontendProxy(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    // 使用相对路径测试代理
    const proxyUrl = '/api/v1/health';
    
    console.log(`🔍 测试前端代理: ${proxyUrl}`);
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      return {
        success: true,
        message: '✅ 前端代理工作正常',
        details: {
          status: response.status,
          data: data.data,
          url: proxyUrl,
        },
      };
    } else {
      throw new Error('代理响应格式不正确');
    }
  } catch (error) {
    return {
      success: false,
      message: `❌ 前端代理失败: ${error instanceof Error ? error.message : '未知错误'}`,
      details: {
        error: error instanceof Error ? error.message : error,
        url: '/api/v1/health',
        suggestion: '请确保前端开发服务器已启动，并且Vite代理配置正确',
      },
    };
  }
}