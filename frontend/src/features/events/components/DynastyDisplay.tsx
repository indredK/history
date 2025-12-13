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
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px',
      margin: '8px 0',
      border: '1px solid #e9ecef',
      overflow: 'hidden'
    }}>
      <div style={{ 
        fontSize: '14px', 
        color: '#495057', 
        marginBottom: '8px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>历史时期</span>
        <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#6c757d' }}>
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
        scrollbarColor: '#ccc #f1f1f1'
      }}>
        <style>
          {`
            div::-webkit-scrollbar {
              height: 6px;
            }
            div::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 3px;
            }
            div::-webkit-scrollbar-thumb {
              background: #ccc;
              border-radius: 3px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: #999;
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
                  fontSize: '13px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: `2px solid ${dynasty.color}`,
                  backgroundColor: `${dynasty.color}15`,
                  cursor: dynasty.isMultiPeriod ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  width: '100%',
                  textAlign: 'center',
                  display: 'block',
                  height: '100%',
                  minHeight: '36px',
                  boxSizing: 'border-box',
                  '& .MuiChip-label': {
                    width: '100%',
                    height: '100%',
                    padding: 0
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
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '6px',
                padding: '12px',
                marginTop: '8px',
                minWidth: '200px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 600,
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
                      fontSize: '12px'
                    }}>
                      <span style={{ fontWeight: 500 }}>{period.name}</span>
                      <span style={{ color: '#666', fontSize: '11px' }}>
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