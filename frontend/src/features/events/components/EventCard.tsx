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
      className="event-item scroll-fade visible"
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
            className={`btn ${isFav ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => toggleFavorite(event.id)}
          >
            {isFav ? '已收藏' : '收藏'}
          </button>
          <button className="btn btn-outline" onClick={handleShare}>
            分享
          </button>
          <details style={{ marginLeft: 'auto' }}>
            <summary className="btn btn-ghost">详情</summary>
            <div style={{ padding: 8 }}>
              {event.startDate && <div>日期：{event.startDate}</div>}
              {event.imageUrls?.[0] && (
                <img
                  src={event.imageUrls[0]}
                  alt={event.title}
                  style={{ maxWidth: '100%', borderRadius: 8, marginTop: 8 }}
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

