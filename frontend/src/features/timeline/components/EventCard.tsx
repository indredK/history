import './EventCard.scss';
import type { Event } from '@/services/timeline/types';
import { useState } from 'react';
import { getTimelineEventCategories } from '@/features/timeline/utils/timelineFilters';
import { formatTimelineYear } from '@/features/timeline/utils/dynastyUtils';

type Props = {
  event: Event;
  index: number;
};

export function EventCard({ event, index }: Props) {
  const [isFav, setIsFav] = useState(false);
  const panelBg = 'var(--app-panel-bg)';
  const panelBorder = 'var(--app-panel-border)';
  const categoryLabel = getTimelineEventCategories(event).join(' / ');
  const eventYearLabel =
    event.endYear !== undefined && event.endYear !== null && event.endYear !== event.startYear
      ? `${formatTimelineYear(event.startYear)} - ${formatTimelineYear(event.endYear)}`
      : formatTimelineYear(event.startYear);

  const handleShare = () => {
    const data: ShareData = {
      title: event.title,
      text: event.description ?? '',
      url: location.href,
    };
    if (navigator.share) {
      navigator.share(data);
    } else {
      navigator.clipboard.writeText(`${event.title} - ${location.href}`);
    }
  };

  return (
    <div
      className="event-item glass-card scroll-fade visible"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="event-year">
        {eventYearLabel}
      </div>
      <div className="event-content">
        <h3>{event.title}</h3>
        <p>{event.description?.substring(0, 140)}...</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            className={`btn glass-button ${isFav ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setIsFav(!isFav)}
            style={{
              backdropFilter: 'var(--app-backdrop-light)',
              WebkitBackdropFilter: 'var(--app-backdrop-light)',
              backgroundColor: isFav ? 'rgba(199, 143, 69, 0.78)' : panelBg,
              color: isFav ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
              border: isFav ? '1px solid rgba(199, 143, 69, 0.36)' : panelBorder,
              borderRadius: 'var(--glass-radius-md, 12px)',
              transition: 'all var(--glass-duration-normal, 250ms) var(--glass-easing, cubic-bezier(0.4, 0, 0.2, 1))'
            }}
          >
            {isFav ? '已收藏' : '收藏'}
          </button>
          <button 
            className="btn btn-outline glass-button-secondary" 
            onClick={handleShare}
            style={{
              backdropFilter: 'var(--app-backdrop-light)',
              WebkitBackdropFilter: 'var(--app-backdrop-light)',
              backgroundColor: 'var(--app-interactive-bg-soft)',
              color: 'var(--color-text-primary)',
              border: panelBorder,
              borderRadius: 'var(--glass-radius-md, 12px)',
              transition: 'all var(--glass-duration-normal, 250ms) var(--glass-easing, cubic-bezier(0.4, 0, 0.2, 1))'
            }}
          >
            分享
          </button>
          <details style={{ marginLeft: 'auto' }}>
            <summary 
              className="btn btn-ghost glass-button"
              style={{
                backdropFilter: 'var(--app-backdrop-light)',
                WebkitBackdropFilter: 'var(--app-backdrop-light)',
                backgroundColor: 'var(--app-interactive-hover-bg)',
                color: 'var(--color-text-primary)',
                border: '1px solid rgba(199, 143, 69, 0.28)',
                borderRadius: 'var(--glass-radius-lg, 16px)'
              }}
            >
              详情
            </summary>
            <div style={{ 
              padding: 8,
              background: panelBg,
              backdropFilter: 'var(--app-backdrop-light)',
              WebkitBackdropFilter: 'var(--app-backdrop-light)',
              borderRadius: 'var(--glass-radius-lg, 16px)',
              border: panelBorder,
              marginTop: 8
            }}>
              {event.startDate && <div>日期：{event.startDate}</div>}
              {event.imageUrls?.[0] && (
                <img
                  src={event.imageUrls[0]}
                  alt={event.title}
                  style={{ 
                    maxWidth: '100%', 
                    borderRadius: 'var(--glass-radius-lg, 16px)', 
                    marginTop: 8,
                    border: '1px solid var(--theme-glass-border-heavy)'
                  }}
                />
              )}
              {categoryLabel && (
                <div>分类：{categoryLabel}</div>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
