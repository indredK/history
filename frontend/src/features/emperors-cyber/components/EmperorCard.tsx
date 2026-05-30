import type { CSSProperties } from 'react';

import { getEmperorDisplayName } from '../data';
import type { CyberEmperor } from '../types';

interface EmperorCardProps {
  emperor: CyberEmperor;
  isActive: boolean;
  onClick: () => void;
  color: string;
}

export function EmperorCard({
  emperor,
  isActive,
  onClick,
  color,
}: EmperorCardProps) {
  return (
    <div
      className={`cyber-emperor-card ${isActive ? 'active' : ''}`}
      style={{ '--card-color': color } as CSSProperties}
      onClick={onClick}
    >
      <div className="cyber-card-border" style={{ borderColor: color }}>
        <div className="cyber-card-corner cyber-card-corner--tl" style={{ borderColor: color }} />
        <div className="cyber-card-corner cyber-card-corner--tr" style={{ borderColor: color }} />
        <div className="cyber-card-corner cyber-card-corner--bl" style={{ borderColor: color }} />
        <div className="cyber-card-corner cyber-card-corner--br" style={{ borderColor: color }} />
      </div>

      <div className="cyber-card-content">
        <div className="cyber-card-dynasty-tag" style={{ borderColor: color, color }}>
          {emperor.dynasty}
        </div>

        <div className="cyber-card-avatar" style={{ boxShadow: `0 0 30px ${color}40, inset 0 0 20px ${color}20` }}>
          <div className="cyber-card-avatar-placeholder" style={{ borderColor: color }}>
            <span style={{ color }}>{getEmperorDisplayName(emperor).charAt(0)}</span>
          </div>
        </div>

        <h3 className="cyber-card-name" style={{ textShadow: `0 0 20px ${color}80` }}>
          {getEmperorDisplayName(emperor)}
        </h3>
        {emperor.title && (
          <div className="cyber-card-temple" style={{ color }}>
            {emperor.title}
          </div>
        )}

        <div className="cyber-card-reign" style={{ color }}>
          {emperor.period}
        </div>

        <div className="cyber-card-tags">
          {emperor.events.slice(0, 3).map((event, eventIndex) => (
            <span
              key={eventIndex}
              className="cyber-card-tag"
              style={{ borderColor: `${color}60`, color: `${color}cc` }}
            >
              {event}
            </span>
          ))}
        </div>

        <div
          className="cyber-card-bottom-line"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />
      </div>
    </div>
  );
}
