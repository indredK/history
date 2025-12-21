import type { Event } from '@/services/timeline/types';
import { useEventsStore } from '@/store';

type Props = {
  event: Event;
  index: number;
};

export function EventCard({ event, index }: Props) {
  const { favorites, toggleFavorite } = useEventsStore();
  const isFav = favorites.includes(event.id);

  const handleShare = () => {
    const data = {
      title: event.title,
      text: event.description ?? '',
      url: location.href,
    } as any;
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
        {event.startYear}
        {event.endYear !== event.startYear && ` - ${event.endYear}`}
      </div>
      <div className="event-content">
        <h3>{event.title}</h3>
        <p>{event.description?.substring(0, 140)}...</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            className={`btn glass-button ${isFav ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => toggleFavorite(event.id)}
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              backgroundColor: isFav ? 'rgba(255, 61, 0, 0.8)' : 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
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
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
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
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                backgroundColor: 'rgba(255, 61, 0, 0.1)',
                border: '1px solid rgba(255, 61, 0, 0.3)',
                borderRadius: 'var(--glass-radius-lg, 16px)'
              }}
            >
              详情
            </summary>
            <div style={{ 
              padding: 8,
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: 'var(--glass-radius-lg, 16px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
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
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                />
              )}
              {event.categories && (
                <div>分类：{event.categories.map((p) => p.join('/')).join('，')}</div>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

