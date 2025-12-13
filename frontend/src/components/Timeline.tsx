import { useTimelineStore, useEventsStore } from '../store';
import { getEventsByRange } from '../api';
import './Timeline.css';

export function Timeline() {
  const { startYear, endYear, setYears } = useTimelineStore();
  const { setEvents, setLoading } = useEventsStore();

  const handleDateChange = async (start: number, end: number) => {
    setYears(start, end);
    setLoading(true);
    try {
      const res = await getEventsByRange(start, end);
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h2>历史时间轴 (Timeline)</h2>
      </div>
      <div className="timeline-controls">
        <div className="control-group">
          <label>开始年份 (Start)</label>
          <input
            type="number"
            value={startYear}
            onChange={(e) => handleDateChange(parseInt(e.target.value), endYear)}
          />
        </div>
        <div className="control-group">
          <label>结束年份 (End)</label>
          <input
            type="number"
            value={endYear}
            onChange={(e) => handleDateChange(startYear, parseInt(e.target.value))}
          />
        </div>
      </div>
      <div className="timeline-display">
        <div className="year-range">
          {startYear} - {endYear}
        </div>
      </div>
    </div>
  );
}
