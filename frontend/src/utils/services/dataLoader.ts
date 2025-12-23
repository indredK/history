// 从 JSON 文件加载数据的通用函数
export async function loadJsonData<T>(path: string): Promise<T[]> {
  try {
    // 处理部署路径，确保在 GitHub Pages 上正确加载
    const basePath = import.meta.env.BASE_URL || '/';
    const fullPath = path.startsWith('/') ? `${basePath.replace(/\/$/, '')}${path}` : path;
    
    const response = await fetch(fullPath);
    if (!response.ok) {
      throw new Error(`Failed to load ${fullPath}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${path}:`, error);
    return [];
  }
}
