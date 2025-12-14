import { useState, useCallback, useMemo } from 'react';
import { DYNASTY_TIMELINE, findBoundaryForYear } from '../services/boundaryMappings';
import './TimelineSlider.css';

interface TimelineSliderProps {
  currentYear: number;
  onYearChange: (year: number) => void;
}

export function TimelineSlider({ currentYear, onYearChange }: TimelineSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  const minYear = -221;
  const maxYear = 1912;
  
  // 找到当前年份对应的朝代
  const currentDynasty = useMemo(() => {
    for (let i = DYNASTY_TIMELINE.length - 1; i >= 0; i--) {
      if (currentYear >= DYNASTY_TIMELINE[i].year) {
        return DYNASTY_TIMELINE[i];
      }
    }
    return DYNASTY_TIMELINE[0];
  }, [currentYear]);

  // 检查当前年份是否有边界数据
  const hasBoundaryData = useMemo(() => {
    return findBoundaryForYear(currentYear) !== null;
  }, [currentYear]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value, 10);
    onYearChange(year);
  }, [onYearChange]);

  const handleDynastyClick = useCallback((year: number) => {
    onYearChange(year);
  }, [onYearChange]);

  // 计算滑块位置百分比
  const sliderPercent = ((currentYear - minYear) / (maxYear - minYear)) * 100;

  return (
    <div className="timeline-slider-container">
      <div className="timeline-header">
        <span className="timeline-title">历史时间轴</span>
        <span className="timeline-current-year">
          {currentYear < 0 ? `公元前 ${Math.abs(currentYear)} 年` : `公元 ${currentYear} 年`}
        </span>
        <span className={`timeline-dynasty ${hasBoundaryData ? 'has-data' : 'no-data'}`}>
          {currentDynasty.name}
          {!hasBoundaryData && <span className="no-data-hint">（暂无地图数据）</span>}
        </span>
      </div>
      
      <div className="timeline-slider-wrapper">
        <div className="timeline-track">
          <div 
            className="timeline-progress" 
            style={{ width: `${sliderPercent}%` }}
          />
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={currentYear}
            onChange={handleSliderChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            className={`timeline-slider ${isDragging ? 'dragging' : ''}`}
          />
        </div>
        
        <div className="timeline-markers">
          {DYNASTY_TIMELINE.map((dynasty) => {
            const percent = ((dynasty.year - minYear) / (maxYear - minYear)) * 100;
            const hasData = findBoundaryForYear(dynasty.year) !== null;
            return (
              <div
                key={dynasty.year}
                className={`timeline-marker ${hasData ? 'has-data' : ''} ${currentYear >= dynasty.year ? 'active' : ''}`}
                style={{ left: `${percent}%` }}
                onClick={() => handleDynastyClick(dynasty.year)}
                title={dynasty.period}
              >
                <div className="marker-dot" />
                <span className="marker-label">{dynasty.name}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="timeline-legend">
        <span className="legend-item has-data">● 有地图数据</span>
        <span className="legend-item no-data">○ 暂无数据</span>
      </div>
    </div>
  );
}
