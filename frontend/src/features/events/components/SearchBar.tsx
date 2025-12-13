import { useEventsStore } from '../../../store';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useEventsStore();
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 16 }}>
      <input
        placeholder="搜索事件..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
        style={{ flex: 1, padding: '8px 12px' }}
      />
    </div>
  );
}

