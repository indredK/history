/**
 * API测试工具
 * 提供API连接测试功能
 */

import { apiClient } from './services/apiClient';

interface TestResult {
  success: boolean;
  message: string;
}

interface EndpointTestResult {
  endpoint: string;
  success: boolean;
  message: string;
}

interface AllEndpointsResult {
  results: EndpointTestResult[];
}

/**
 * 测试前端代理连接
 */
export async function testFrontendProxy(): Promise<TestResult> {
  try {
    const response = await fetch('/api/v1/health');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return { success: true, message: '前端代理连接正常' };
  } catch {
    return { success: false, message: '前端代理连接失败' };
  }
}

/**
 * 测试直接API连接
 */
export async function testApiConnection(): Promise<TestResult> {
  try {
    await apiClient.get('/health');
    return { success: true, message: 'API连接正常' };
  } catch {
    return { success: false, message: 'API连接失败' };
  }
}

/**
 * 测试所有API端点
 */
export async function testAllApiEndpoints(): Promise<AllEndpointsResult> {
  const endpoints = [
    '/dynasties',
    '/events',
    '/persons',
    '/places',
  ];

  const results = await Promise.all(
    endpoints.map(async (endpoint) => {
      try {
        await apiClient.get(endpoint);
        return { endpoint, success: true, message: `${endpoint} 正常` };
      } catch {
        return { endpoint, success: false, message: `${endpoint} 不可用` };
      }
    })
  );

  return { results };
}
