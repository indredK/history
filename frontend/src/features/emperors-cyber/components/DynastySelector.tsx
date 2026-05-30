import type { CSSProperties } from 'react';

import type { DynastyItem } from '../types';

interface DynastySelectorProps {
  dynasties: DynastyItem[];
  activeDynasty: string;
  onSelect: (dynastyId: string) => void;
  emperorCounts: Record<string, number>;
}

export function DynastySelector({
  dynasties,
  activeDynasty,
  onSelect,
  emperorCounts,
}: DynastySelectorProps) {
  return (
    <aside className="cyber-rail cyber-rail--dynasty">
      <div className="cyber-rail-list" role="listbox" aria-label="朝代选择">
        {dynasties.map((dynasty) => {
          const count = emperorCounts[dynasty.id] || 0;
          const isActive = dynasty.id === activeDynasty;

          return (
            <button
              key={dynasty.id}
              type="button"
              className={`cyber-rail-item cyber-dynasty-option ${isActive ? 'is-active' : ''}`}
              style={{ '--item-accent': dynasty.color } as CSSProperties}
              onClick={() => onSelect(dynasty.id)}
              aria-pressed={isActive}
              aria-label={`切换到${dynasty.name}`}
            >
              <span className="cyber-rail-item-marker" aria-hidden="true" />
              <span className="cyber-rail-item-copy">
                <span className="cyber-rail-item-title">{dynasty.name}</span>
                <span className="cyber-rail-item-subtitle">{dynasty.era}</span>
              </span>
              <span className="cyber-rail-item-meta">{count > 0 ? `${count}位` : '空'}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
