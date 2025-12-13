
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
      padding: '8px',
      backgroundColor: 'var(--color-bg-card)',
      borderRadius: 'var(--radius-xl)',
      margin: '8px 0',
      border: '1px solid var(--color-border-medium)',
      boxShadow: 'var(--shadow-md)',
      transition: 'all var(--transition-normal)'
    }}>
      <div style={{
        width: '100%',
        height: '180px',
        position: 'relative'
      }}>
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          spaceBetween={20}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 150,
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
                width: dynasty.isMultiPeriod ? '180px' : '140px',
                height: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: 'var(--shadow-md)',
                transition: 'all var(--transition-normal)'
              }}>
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
                  color: 'var(--color-text-inverse)',
                  textAlign: 'center',
                  border: `3px solid ${dynasty.color}`,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all var(--transition-normal)',
                  animation: 'fadeIn 0.5s ease-out'
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
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  zIndex: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(255,255,255,0.3)',
                  transition: 'all var(--transition-normal)'
                }}>
                  {dynasty.name}
                </div>
                
                <div style={{
                  fontSize: '10px',
                  opacity: 0.9,
                  marginBottom: '8px',
                  zIndex: 1
                }}>
                  {dynasty.nameEn}
                </div>
                
                <div style={{
                  fontSize: '11px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  marginBottom: '8px',
                  zIndex: 1,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(5px)'
                }}>
                  {dynasty.startYear} - {dynasty.endYear}
                </div>
                
                <div style={{
                  fontSize: '10px',
                  lineHeight: '1.4',
                  maxHeight: '40px',
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
    </div>
  );
}
