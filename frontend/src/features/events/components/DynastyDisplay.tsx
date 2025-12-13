import { useMemo, useState } from 'react';
import { Chip, Tooltip } from '@mui/material';
import { getDynastiesFromEvents, getDynastiesInRange } from '../utils/dynastyUtils';
import { useTimelineStore, useEventsStore } from '../../../store';
import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';

interface DynastyDisplayProps {
  className?: string;
}

export function DynastyDisplay({ className }: DynastyDisplayProps) {
  const { startYear, endYear } = useTimelineStore();
  const { events } = useEventsStore();
  const [expandedDynasties, setExpandedDynasties] = useState<Set<string>>(new Set());
  
  // 获取当前显示相关的朝代
  const dynasties = useMemo(() => {
    if (events.length > 0) {
      // 如果有事件数据，根据事件获取相关朝代
      return getDynastiesFromEvents(events);
    } else {
      // 否则根据当前年份范围获取朝代
      return getDynastiesInRange(startYear, endYear);
    }
  }, [events, startYear, endYear]);
  
  const toggleExpanded = (dynastyName: string) => {
    const newExpanded = new Set(expandedDynasties);
    if (newExpanded.has(dynastyName)) {
      newExpanded.delete(dynastyName);
    } else {
      newExpanded.add(dynastyName);
    }
    setExpandedDynasties(newExpanded);
  };
  
  if (dynasties.length === 0) {
    return null;
  }
  
  return (
    <div className={className} style={{ 
      padding: '16px', 
      backgroundColor: 'var(--color-bg-secondary)', 
      borderRadius: 'var(--radius-xl)',
      margin: '8px 0',
      border: '1px solid var(--color-border-medium)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-md)',
      position: 'relative',
      zIndex: 1
    }}>
      <div style={{ 
        fontSize: 'var(--font-size-sm)', 
        color: 'var(--color-text-primary)', 
        marginBottom: '8px',
        fontWeight: 'var(--font-weight-semibold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>历史时期</span>
        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'normal', color: 'var(--color-text-tertiary)' }}>
          点击朝代查看详情
        </span>
      </div>
      
      <div style={{ 
        display: 'flex', 
        flexWrap: 'nowrap', 
        gap: '12px',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        overflowX: 'auto',
        paddingBottom: '8px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--color-primary) var(--color-bg-tertiary)'
      }}>
        <style>
          {`
            div::-webkit-scrollbar {
              height: 6px;
            }
            div::-webkit-scrollbar-track {
              background: var(--color-bg-tertiary);
              border-radius: var(--radius-full);
            }
            div::-webkit-scrollbar-thumb {
              background: var(--color-primary);
              border-radius: var(--radius-full);
              transition: all var(--transition-normal);
            }
            div::-webkit-scrollbar-thumb:hover {
              background: var(--color-primary-light);
              box-shadow: 0 0 10px rgba(255, 61, 0, 0.5);
            }
          `}
        </style>
        {dynasties.map((dynasty) => (
          <div key={dynasty.name} style={{ 
            position: 'relative',
            flex: '0 0 auto',
            minWidth: dynasty.isMultiPeriod ? '140px' : '100px',
            maxWidth: dynasty.isMultiPeriod ? '200px' : '150px'
          }}>
            <Tooltip 
              title={
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {dynasty.name} ({dynasty.startYear} - {dynasty.endYear})
                  </div>
                  {dynasty.isMultiPeriod && (
                    <div style={{ fontSize: '12px', color: '#ccc' }}>
                      包含多个政权时期
                    </div>
                  )}
                </div>
              }
            >
              <Chip
                label={
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    gap: '6px',
                    width: '100%',
                    fontSize: '12px'
                  }}>
                    <span style={{ fontWeight: 500, flex: 1 }}>{dynasty.name}</span>
                    {dynasty.isMultiPeriod && (
                      <span style={{ fontSize: '10px' }}>
                        {expandedDynasties.has(dynasty.name) ? 
                          <KeyboardArrowDown /> : <KeyboardArrowRight />
                        }
                      </span>
                    )}
                  </div>
                }
                sx={{
                  fontSize: 'var(--font-size-sm)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${dynasty.color}`,
                  backgroundColor: `${dynasty.color}15`,
                  cursor: dynasty.isMultiPeriod ? 'pointer' : 'default',
                  transition: 'all var(--transition-normal)',
                  position: 'relative',
                  width: '100%',
                  textAlign: 'center',
                  display: 'block',
                  height: '100%',
                  minHeight: '36px',
                  boxSizing: 'border-box',
                  boxShadow: `0 0 0 rgba(${parseInt(dynasty.color.slice(1,3),16)}, ${parseInt(dynasty.color.slice(3,5),16)}, ${parseInt(dynasty.color.slice(5,7),16)}, 0)`,
                  '&:hover': {
                    backgroundColor: `${dynasty.color}25`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px rgba(${parseInt(dynasty.color.slice(1,3),16)}, ${parseInt(dynasty.color.slice(3,5),16)}, ${parseInt(dynasty.color.slice(5,7),16)}, 0.3), 0 0 20px rgba(${parseInt(dynasty.color.slice(1,3),16)}, ${parseInt(dynasty.color.slice(3,5),16)}, ${parseInt(dynasty.color.slice(5,7),16)}, 0.2)`
                  },
                  '& .MuiChip-label': {
                    width: '100%',
                    height: '100%',
                    padding: 0,
                    color: 'var(--color-text-primary)',
                    fontWeight: 'var(--font-weight-medium)'
                  }
                }}
                onClick={() => dynasty.isMultiPeriod && toggleExpanded(dynasty.name)}
              />
            </Tooltip>
            
            {/* 多时期展开详情 */}
            {dynasty.isMultiPeriod && expandedDynasties.has(dynasty.name) && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                zIndex: 1000,
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--radius-xl)',
                padding: '16px',
                marginTop: '8px',
                minWidth: '200px',
                boxShadow: 'var(--shadow-xl), 0 0 20px rgba(255, 61, 0, 0.15)',
                animation: 'fadeInUp 0.3s ease-out'
              }}>
                <div style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: dynasty.color,
                  marginBottom: '8px',
                  paddingBottom: '4px',
                  borderBottom: `1px solid ${dynasty.color}30`
                }}>
                  {dynasty.name} 包含的政权：
                </div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dynasty.subPeriods?.map((period) => (
                    <div key={period.name} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 'var(--font-size-xs)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg-tertiary)',
                      transition: 'all var(--transition-fast)'
                    }}>
                      <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{period.name}</span>
                      <span style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
                        {period.startYear}-{period.endYear}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}