import type { ThemeMode } from '@/config/themeConfig';
import type { StyleMode } from '@/config/styles/types';

type RootTransitionClass = 'theme-transitioning' | 'style-transitioning';

function getRootElement(): HTMLElement | null {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.documentElement;
}

export function readStoredMode<T extends string>(
  storageKey: string,
  isValid: (value: unknown) => value is T,
  fallback: T,
): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved && isValid(saved)) {
      return saved;
    }
  } catch (error) {
    console.warn(`Failed to read "${storageKey}" from localStorage:`, error);
  }

  return fallback;
}

export function writeStoredMode(storageKey: string, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, value);
  } catch (error) {
    console.warn(`Failed to save "${storageKey}" to localStorage:`, error);
  }
}

export function applyThemeToDOM(theme: ThemeMode): void {
  const root = getRootElement();
  if (!root) {
    return;
  }

  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;
}

export function applyStyleToDOM(style: StyleMode): void {
  const root = getRootElement();
  if (!root) {
    return;
  }

  root.setAttribute('data-style', style);
}

export function runRootTransition(
  transitionClass: RootTransitionClass,
  apply: () => void,
  durationMs = 220,
): void {
  const root = getRootElement();
  if (!root || typeof window === 'undefined') {
    apply();
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    apply();
    return;
  }

  root.classList.add(transitionClass);
  window.requestAnimationFrame(() => {
    apply();
  });

  window.setTimeout(() => {
    root.classList.remove(transitionClass);
  }, durationMs);
}

export function bindStorageSync<T extends string>(
  storageKey: string,
  isValid: (value: unknown) => value is T,
  onValue: (value: T) => void,
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== storageKey || event.newValue === null) {
      return;
    }

    if (!isValid(event.newValue)) {
      return;
    }

    onValue(event.newValue);
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('storage', handleStorage);
  };
}
