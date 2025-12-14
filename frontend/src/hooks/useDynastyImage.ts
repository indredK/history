import { useState, useEffect } from 'react';

interface UseDynastyImageReturn {
  imageUrl: string | null;
  isLoading: boolean;
  error: Error | null;
}

// Global cache to persist across component re-renders
const imageCache = new Map<string, string>();

/**
 * Hook for lazy loading dynasty images with caching
 * @param dynastyId - The ID of the dynasty to load the image for
 * @returns Object containing imageUrl, isLoading state, and error
 */
export function useDynastyImage(dynastyId: string | null): UseDynastyImageReturn {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state if dynastyId is null
    if (!dynastyId) {
      setImageUrl(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Check cache first
    const cachedUrl = imageCache.get(dynastyId);
    if (cachedUrl) {
      setImageUrl(cachedUrl);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Load image dynamically
    setIsLoading(true);
    setError(null);

    // Dynamic import of the image
    import(`../assets/images/dynasties/${dynastyId}.svg`)
      .then((module) => {
        const url = module.default;
        // Store in cache
        imageCache.set(dynastyId, url);
        setImageUrl(url);
        setIsLoading(false);
      })
      .catch((err) => {
        const error = err instanceof Error ? err : new Error(`Failed to load image for dynasty: ${dynastyId}`);
        setError(error);
        setImageUrl(null);
        setIsLoading(false);
      });
  }, [dynastyId]);

  return { imageUrl, isLoading, error };
}
