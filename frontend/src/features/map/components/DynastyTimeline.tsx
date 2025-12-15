import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getDynasties } from '../../../services/dataClient';
import { Dynasty } from '../../../services/culture/types';
import styles from './DynastyTimeline.module.css';

interface DynastyTimelineProps {
  onDynastySelect?: (dynasty: Dynasty) => void;
  selectedDynastyId?: string;
}

export const DynastyTimeline: React.FC<DynastyTimelineProps> = ({
  onDynastySelect,
  selectedDynastyId
}) => {
  const [dynasties, setDynasties] = useState<Dynasty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDynasty, setSelectedDynasty] = useState<Dynasty | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const MIN_YEAR = -2070;
  const MAX_YEAR = 2025;
  const YEAR_RANGE = MAX_YEAR - MIN_YEAR;

  useEffect(() => {
    fetchDynasties();
  }, []);

  useEffect(() => {
    if (selectedDynastyId && dynasties.length > 0) {
      const dynasty = dynasties.find(d => d.id === selectedDynastyId);
      if (dynasty) {
        setSelectedDynasty(dynasty);
        const pos = ((dynasty.startYear - MIN_YEAR) / YEAR_RANGE) * 100;
        setSliderPosition(pos);
      }
    }
  }, [selectedDynastyId, dynasties]);

  const fetchDynasties = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getDynasties();
      const sortedDynasties = result.data.sort((a: Dynasty, b: Dynasty) => a.startYear - b.startYear);
      setDynasties(sortedDynasties);
    } catch (err) {
      setError('获取朝代数据失败');
      console.error('Failed to fetch dynasties:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatYear = (year: number) => {
    if (year < 0) {
      return `公元前${Math.abs(year)}年`;
    }
    return `公元${year}年`;
  };

  const positionToYear = (position: number) => {
    return MIN_YEAR + (position / 100) * YEAR_RANGE;
  };

  const findNearestDynasty = useCallback((year: number): Dynasty | null => {
    if (dynasties.length === 0) return null;
    
    let nearest = dynasties[0];
    let minDistance = Math.abs(dynasties[0].startYear - year);
    
    for (const dynasty of dynasties) {
      const distance = Math.abs(dynasty.startYear - year);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = dynasty;
      }
    }
    return nearest;
  }, [dynasties]);

  const handleSliderMove = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
    
    const year = positionToYear(percentage);
    const nearest = findNearestDynasty(year);
    if (nearest && nearest.id !== selectedDynasty?.id) {
      setSelectedDynasty(nearest);
      onDynastySelect?.(nearest);
    }
  }, [findNearestDynasty, selectedDynasty, onDynastySelect]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleSliderMove(e.clientX);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleSliderMove(e.clientX);
    }
  }, [isDragging, handleSliderMove]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      // 吸附到最近的朝代
      if (selectedDynasty) {
        const pos = ((selectedDynasty.startYear - MIN_YEAR) / YEAR_RANGE) * 100;
        setSliderPosition(pos);
      }
    }
  }, [isDragging, selectedDynasty]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 触摸事件支持
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleSliderMove(e.touches[0].clientX);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging) {
      handleSliderMove(e.touches[0].clientX);
    }
  }, [isDragging, handleSliderMove]);

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (selectedDynasty) {
        const pos = ((selectedDynasty.startYear - MIN_YEAR) / YEAR_RANGE) * 100;
        setSliderPosition(pos);
      }
    }
  }, [isDragging, selectedDynasty]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
      return () => {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  // 获取当前朝代的索引
  const getCurrentDynastyIndex = useCallback(() => {
    if (!selectedDynasty || dynasties.length === 0) return 0;
    return dynasties.findIndex(d => d.id === selectedDynasty.id);
  }, [selectedDynasty, dynasties]);

  // 鼠标滚轮横向滚动 - 每次滚动移动到相邻朝代
  useEffect(() => {
    const container = containerRef.current;
    if (!container || dynasties.length === 0) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY || e.deltaX;
      const direction = delta > 0 ? 1 : -1;
      
      const currentIndex = getCurrentDynastyIndex();
      const newIndex = Math.max(0, Math.min(dynasties.length - 1, currentIndex + direction));
      
      if (newIndex !== currentIndex) {
        const newDynasty = dynasties[newIndex];
        setSelectedDynasty(newDynasty);
        const pos = ((newDynasty.startYear - MIN_YEAR) / YEAR_RANGE) * 100;
        setSliderPosition(pos);
        onDynastySelect?.(newDynasty);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [dynasties, getCurrentDynastyIndex, onDynastySelect]);

  const handleDynastyClick = (dynasty: Dynasty) => {
    setSelectedDynasty(dynasty);
    const pos = ((dynasty.startYear - MIN_YEAR) / YEAR_RANGE) * 100;
    setSliderPosition(pos);
    onDynastySelect?.(dynasty);
  };

  if (loading) {
    return <div className={styles.loading}>加载中...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.timelineContainer} ref={containerRef}>
      <div className={styles.timelineHeader}>
        <span className={styles.title}>朝代时间轴</span>
        {selectedDynasty && (
          <div className={styles.selectedInfo}>
            <div 
              className={styles.colorIndicator} 
              style={{ backgroundColor: selectedDynasty.color }} 
            />
            <span className={styles.selectedName}>{selectedDynasty.name}</span>
            <span className={styles.selectedYears}>
              ({formatYear(selectedDynasty.startYear)} - {selectedDynasty.endYear ? formatYear(selectedDynasty.endYear) : '至今'})
            </span>
          </div>
        )}
      </div>
      
      <div className={styles.timelineContent}>
        <div 
          ref={trackRef}
          className={styles.timelineTrack}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* 朝代标记点 */}
          {dynasties.map((dynasty) => (
            <div 
              key={dynasty.id}
              className={`${styles.dynastyMark} ${selectedDynasty?.id === dynasty.id ? styles.activeMark : ''}`}
              style={{ 
                left: `${((dynasty.startYear - MIN_YEAR) / YEAR_RANGE) * 100}%`,
                backgroundColor: dynasty.color
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleDynastyClick(dynasty);
              }}
              title={dynasty.name}
            />
          ))}
          
          {/* 可拖动的滑块 */}
          <div 
            className={`${styles.slider} ${isDragging ? styles.dragging : ''}`}
            style={{ left: `${sliderPosition}%` }}
          >
            <div 
              className={styles.sliderHandle}
              style={{ backgroundColor: selectedDynasty?.color || '#1890ff' }}
            />
          </div>
        </div>
        
        {/* 年份刻度 */}
        <div className={styles.yearMarkers}>
          {[-2000, -1000, 0, 1000, 2000].map((year) => (
            <div 
              key={year}
              className={styles.yearMarker}
              style={{ left: `${((year - MIN_YEAR) / YEAR_RANGE) * 100}%` }}
            >
              <span>{year < 0 ? `${Math.abs(year)}BC` : year === 0 ? '0' : `${year}AD`}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
