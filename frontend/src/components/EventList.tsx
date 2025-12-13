import { useEventsStore } from '../store';
import './EventList.css';

export function EventList() {
  const { events, loading } = useEventsStore();

  if (loading) {
    return <div className="event-list-loading">加载中...</div>;
  }

  return (
    <div className="event-list-container">
      <div className="event-list-header">
        <h2>历史事件 ({events.length})</h2>
      </div>
      <div className="event-list">
        {events.length === 0 ? (
          <div className="event-list-empty">暂无事件</div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="event-item">
              <div className="event-year">
                {event.startYear}
                {event.endYear !== event.startYear && ` - ${event.endYear}`}
              </div>
              <div className="event-content">
                <h3>{event.title}</h3>
                <p>{event.description?.substring(0, 100)}...</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
