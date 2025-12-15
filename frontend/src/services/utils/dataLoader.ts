// 从 JSON 文件加载数据的通用函数
export async function loadJsonData<T>(path: string): Promise<T[]> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${path}:`, error);
    return [];
  }
}
