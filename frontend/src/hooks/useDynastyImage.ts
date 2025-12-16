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

    // Load image from public directory
    const imageUrl = `/images/dynasties/${dynastyId}.svg`;
    
    // Check if image exists by creating an Image object
    const img = new Image();
    img.onload = () => {
      // Store in cache
      imageCache.set(dynastyId, imageUrl);
      setImageUrl(imageUrl);
      setIsLoading(false);
    };
    img.onerror = () => {
      const error = new Error(`Failed to load image for dynasty: ${dynastyId}`);
      setError(error);
      setImageUrl(null);
      setIsLoading(false);
    };
    img.src = imageUrl;
  }, [dynastyId]);

  return { imageUrl, isLoading, error };
}
