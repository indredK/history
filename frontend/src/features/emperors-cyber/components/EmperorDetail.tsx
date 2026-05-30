import type { CSSProperties } from 'react';

import { getEmperorDisplayName } from '../data';
import type { CyberEmperor } from '../types';

interface EmperorDetailProps {
  emperor: CyberEmperor | null;
  color: string;
  emperorIndex: number;
  emperorCount: number;
}

export function EmperorDetail({
  emperor,
  color,
  emperorIndex,
  emperorCount,
}: EmperorDetailProps) {
  if (!emperor) {
    return (
      <section className="cyber-focus-panel cyber-focus-panel--empty">
        <div className="cyber-focus-empty">请先选择一位帝王</div>
      </section>
    );
  }

  return (
    <section
      className="cyber-focus-panel"
      style={{
        '--detail-color': color,
        '--detail-color-soft': `${color}26`,
      } as CSSProperties}
    >
      <div className="cyber-focus-panel-glow" aria-hidden="true" />
      <div className="cyber-focus-order cyber-focus-order--floating">
        {(emperorIndex + 1).toString().padStart(2, '0')} / {emperorCount.toString().padStart(2, '0')}
      </div>

      <div className="cyber-focus-hero">
        <div className="cyber-focus-seal" aria-hidden="true">
          <span>{getEmperorDisplayName(emperor).charAt(0)}</span>
        </div>

        <div className="cyber-focus-titles">
          <div className="cyber-focus-dynasty">{emperor.dynasty}</div>
          <h3 className="cyber-focus-name">{getEmperorDisplayName(emperor)}</h3>
          {emperor.title && <p className="cyber-focus-ruler-title">{emperor.title}</p>}
          <div className="cyber-focus-meta">
            <span>{emperor.period}</span>
            <span>{emperor.yearNames.length} 个年号</span>
            <span>{emperor.events.length} 条纪事</span>
          </div>
        </div>
      </div>

      <div className="cyber-focus-divider" aria-hidden="true" />

      <div className="cyber-focus-grid">
        <section className="cyber-focus-section">
          <h4 className="cyber-focus-section-title">时代背景</h4>
          <p className="cyber-focus-paragraph">
            {emperor.summary || `${emperor.dynasty}时期的帝王档案正在整理中。`}
          </p>
        </section>

        <section className="cyber-focus-section">
          <h4 className="cyber-focus-section-title">年号</h4>
          {emperor.yearNames.length > 0 ? (
            <div className="cyber-focus-chip-list">
              {emperor.yearNames.map((yearName, index) => (
                <span key={`${yearName}-${index}`} className="cyber-focus-chip">
                  {yearName}
                </span>
              ))}
            </div>
          ) : (
            <p className="cyber-focus-empty-text">暂无年号记录</p>
          )}
        </section>

        <section className="cyber-focus-section cyber-focus-section--wide">
          <h4 className="cyber-focus-section-title">重要事件</h4>
          {emperor.events.length > 0 ? (
            <ol className="cyber-focus-event-list">
              {emperor.events.map((event, index) => (
                <li key={`${event}-${index}`} className="cyber-focus-event-item">
                  <span className="cyber-focus-event-index">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span>{event}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="cyber-focus-empty-text">暂无纪事记录</p>
          )}
        </section>
      </div>
    </section>
  );
}
