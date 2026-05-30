import type { CSSProperties } from 'react';

import type { CyberEmperor } from '../types';

interface EmperorSelectorProps {
  emperors: CyberEmperor[];
  activeEmperorId: string;
  onSelect: (emperorId: string) => void;
  accentColor: string;
}

export function EmperorSelector({
  emperors,
  activeEmperorId,
  onSelect,
  accentColor,
}: EmperorSelectorProps) {
  return (
    <aside className="cyber-rail cyber-rail--emperor">
      {emperors.length === 0 ? (
        <div className="cyber-rail-empty">该朝代暂无帝王数据</div>
      ) : (
        <div className="cyber-rail-list" role="listbox" aria-label="帝王选择">
          {emperors.map((emperor, index) => {
            const isActive = emperor.id === activeEmperorId;

            return (
              <button
                key={emperor.id}
                type="button"
                className={`cyber-rail-item cyber-emperor-option ${isActive ? 'is-active' : ''}`}
                style={{ '--item-accent': accentColor } as CSSProperties}
                onClick={() => onSelect(emperor.id)}
                aria-pressed={isActive}
                aria-label={`选择${emperor.name}`}
              >
                <span className="cyber-rail-item-marker" aria-hidden="true" />
                <span className="cyber-rail-item-copy">
                  <span className="cyber-rail-item-title">{emperor.name}</span>
                  <span className="cyber-rail-item-subtitle">{emperor.title || emperor.period}</span>
                </span>
                <span className="cyber-rail-item-meta">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}
