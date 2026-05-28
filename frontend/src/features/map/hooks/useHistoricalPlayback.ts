import { useEffect, useMemo } from 'react';
import type { Dynasty } from '@/services/culture/types';
import type { PlaybackState, PlaybackSpeed } from '@/store/mapStore';

const TICK_MS = 250;

function getStepYears(speed: PlaybackSpeed): number {
  switch (speed) {
    case 'slow':
      return 1;
    case 'fast':
      return 10;
    case 'medium':
    default:
      return 5;
  }
}

function getDynastyRange(
  dynastyId: string | null,
  dynasties: Dynasty[],
): [number, number] | null {
  if (!dynastyId) return null;
  const dynasty = dynasties.find((item) => item.id === dynastyId);
  if (!dynasty) return null;
  return [dynasty.startYear, dynasty.endYear ?? dynasty.startYear];
}

export interface HistoricalPlaybackOptions {
  selectedDynastyId: string | null;
  eventFocusRange: [number, number] | null;
  visibleRange: [number, number] | null;
  playheadYear: number | null;
  focusYear: number | null;
  playbackState: PlaybackState;
  playbackSpeed: PlaybackSpeed;
  onPlayheadYearChange: (year: number) => void;
  onFocusYearChange: (year: number) => void;
  onPause: () => void;
}

export function useHistoricalPlayback(
  dynasties: Dynasty[],
  options: HistoricalPlaybackOptions,
) {
  const {
    selectedDynastyId,
    eventFocusRange,
    visibleRange,
    playheadYear,
    focusYear,
    playbackState,
    playbackSpeed,
    onPlayheadYearChange,
    onFocusYearChange,
    onPause,
  } = options;

  const playbackRange = useMemo<[number, number] | null>(() => {
    if (eventFocusRange) return eventFocusRange;
    if (visibleRange) return visibleRange;
    const dynastyRange = getDynastyRange(selectedDynastyId, dynasties);
    if (dynastyRange) return dynastyRange;
    return null;
  }, [dynasties, eventFocusRange, selectedDynastyId, visibleRange]);

  useEffect(() => {
    if (playbackState !== 'playing') return;
    if (!playbackRange) return;

    const stepYears = getStepYears(playbackSpeed);
    const [rangeStart, rangeEnd] = playbackRange;

    const timer = window.setInterval(() => {
      const currentYear = playheadYear ?? focusYear ?? rangeStart;
      const nextYear = currentYear + stepYears;

      if (nextYear >= rangeEnd) {
        onPlayheadYearChange(rangeEnd);
        onFocusYearChange(rangeEnd);
        onPause();
        return;
      }

      onPlayheadYearChange(nextYear);
      onFocusYearChange(nextYear);
    }, TICK_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    focusYear,
    onFocusYearChange,
    onPause,
    onPlayheadYearChange,
    playbackRange,
    playbackSpeed,
    playbackState,
    playheadYear,
  ]);

  return {
    playbackRange,
    stepYears: getStepYears(playbackSpeed),
  };
}
