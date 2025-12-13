import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import { useTimelineStore } from '../../../store';
import { getDynastiesInRange } from '../utils/dynastyUtils';

interface Dynasty3DWheelProps {
  className?: string;
}

export function Dynasty3DWheel({ className }: Dynasty3DWheelProps) {
  const { startYear, endYear } = useTimelineStore();
  
  // 获取当前年份范围内的朝代
  const dynasties = getDynastiesInRange(startYear, endYear);
  
  if (dynasties.length === 0) {
    return null;
  }
  
  return (
    <div className={className} style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      margin: '12px 0',
      border: '1px solid #e9ecef'
    }}>
      <div style={{
        fontSize: '16px',
        color: '#495057',
        marginBottom: '20px',
        fontWeight: 700,
        textAlign: 'center'
      }}>
        历史朝代 3D 选择器
      </div>
      
      <div style={{
        width: '100%',
        height: '300px',
        position: 'relative'
      }}>
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 200,
            modifier: 1,
            slideShadows: true,
          }}
          mousewheel={{
            invert: false,
            thresholdDelta: 10
          }}
          modules={[EffectCoverflow, Mousewheel]}
          className="dynasty-3d-wheel"
          style={{
            width: '100%',
            height: '100%'
          }}
        >
          {dynasties.map((dynasty) => (
            <SwiperSlide
              key={dynasty.name}
              style={{
                width: dynasty.isMultiPeriod ? '220px' : '180px',
                height: '280px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: dynasty.color,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                  color: 'white',
                  textAlign: 'center',
                  border: `3px solid ${dynasty.color}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* 装饰背景 */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: `radial-gradient(circle, ${dynasty.color}60 0%, transparent 70%)`,
                  opacity: 0.3
                }} />
                
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  zIndex: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {dynasty.name}
                </div>
                
                <div style={{
                  fontSize: '12px',
                  opacity: 0.9,
                  marginBottom: '12px',
                  zIndex: 1
                }}>
                  {dynasty.nameEn}
                </div>
                
                <div style={{
                  fontSize: '14px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  zIndex: 1
                }}>
                  {dynasty.startYear} - {dynasty.endYear}
                </div>
                
                <div style={{
                  fontSize: '12px',
                  lineHeight: '1.5',
                  maxHeight: '80px',
                  overflow: 'hidden',
                  zIndex: 1
                }}>
                  {dynasty.description}
                </div>
                
                {dynasty.isMultiPeriod && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    fontSize: '10px',
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    padding: '3px 8px',
                    borderRadius: '10px',
                    zIndex: 1
                  }}>
                    多政权
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      <div style={{
        fontSize: '12px',
        color: '#6c757d',
        textAlign: 'center',
        marginTop: '12px'
      }}>
        💡 使用鼠标滚轮滚动查看更多朝代
      </div>
    </div>
  );
}
