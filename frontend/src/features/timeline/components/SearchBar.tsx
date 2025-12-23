import { useState } from 'react';

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 16 }}>
      <input
        placeholder="搜索事件..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
        style={{
          flex: 1,
          padding: '12px 16px',
          backgroundColor: 'var(--color-bg-tertiary)',
          border: '2px solid var(--color-border-medium)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--color-text-primary)',
          fontSize: 'var(--font-size-base)',
          transition: 'all var(--transition-normal)',
          boxShadow: '0 0 0 rgba(255, 61, 0, 0)',
          outline: 'none'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--color-primary)';
          e.target.style.boxShadow = '0 0 20px rgba(255, 61, 0, 0.3)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--color-border-medium)';
          e.target.style.boxShadow = '0 0 0 rgba(255, 61, 0, 0)';
        }}
      />
    </div>
  );
}