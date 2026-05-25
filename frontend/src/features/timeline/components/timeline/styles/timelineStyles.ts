/**
 * TimelineChart 视觉样式
 */

import type { CSSProperties } from 'react';

export const timelineStyles: Record<string, CSSProperties> = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid rgba(99, 102, 241, 0.15)',
    borderRadius: '8px',
    backgroundColor: 'rgba(248, 250, 252, 0.1)',
    backdropFilter: 'blur(2px)',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'rgba(71, 85, 105, 0.7)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px 8px 16px',
    borderBottom: '1px solid rgba(99, 102, 241, 0.15)',
  },
  title: {
    margin: 0,
    color: 'var(--color-text-primary)',
    fontWeight: '600',
    fontSize: '16px',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  helpText: {
    fontSize: '10px',
    color: 'rgba(71, 85, 105, 0.6)',
    marginLeft: '12px',
    fontStyle: 'italic',
  },
  zoomText: {
    fontSize: '12px',
    color: 'rgba(71, 85, 105, 0.7)',
    marginRight: '8px',
  },
  button: {
    width: '28px',
    height: '28px',
    border: '1px solid rgba(99, 102, 241, 0.25)',
    borderRadius: '6px',
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: 'rgba(99, 102, 241, 0.8)',
    transition: 'all 0.2s ease',
  },
  resetButton: {
    fontSize: '12px',
  },
  panButton: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  svgContainer: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  svg: {
    width: '100%',
    height: '100%',
    display: 'block',
    touchAction: 'none',
  },
  buttonHover: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  buttonDefault: {
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
};
