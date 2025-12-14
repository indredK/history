
import React, { useMemo, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import { useTimelineStore, useDynastyStore } from '../../../store';
import { getDynasties } from '../../../services/dataClient';
import { useDynastyImage } from '../../../hooks/useDynastyImage';
import type { Dynasty } from '../../../types/models';

interface Dynasty3DWheelProps {
  className?: string;
}

// 单个朝代卡片组件，使用懒加载
interface DynastySlideProps {
  dynasty: Dynasty;
}

function DynastySlide({ dynasty }: DynastySlideProps) {
  const { imageUrl } = useDynastyImage(dynasty.id);

  // 使用朝代的颜色，如果没有则使用默认颜色
  const dynastyColor = dynasty.color || '#8B4513';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: dynastyColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        color: 'var(--color-text-inverse)',
        textAlign: 'center',
        border: `3px solid ${dynastyColor}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all var(--transition-normal)',
        backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 半透明遮罩层，确保文字可读 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: `${dynastyColor}80`,
        zIndex: 0,
      }} />

      {/* 装饰背景 */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: `radial-gradient(circle, ${dynastyColor}60 0%, transparent 70%)`,
        opacity: 0.3,
        zIndex: 0,
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

      {dynasty.name_en && (
        <div style={{
          fontSize: '10px',
          opacity: 0.9,
          marginBottom: '8px',
          zIndex: 1
        }}>
          {dynasty.name_en}
        </div>
      )}

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
        {dynasty.startYear} - {dynasty.endYear || '现在'}
      </div>

      {dynasty.description && (
        <div style={{
          fontSize: '9px',
          opacity: 0.8,
          maxWidth: '90%',
          zIndex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {dynasty.description}
        </div>
      )}
    </div>
  );
}

export function Dynasty3DWheel({ className }: Dynasty3DWheelProps) {
  const { startYear, endYear } = useTimelineStore();
  const { setSelectedDynasty } = useDynastyStore();
  const [allDynasties, setAllDynasties] = useState<Dynasty[]>([]);

  // 加载朝代数据
  useEffect(() => {
    getDynasties()
      .then((response) => {
        setAllDynasties(response.data);
      })
      .catch((err) => {
        console.error('Failed to load dynasties', err);
      });
  }, []);

  // 获取当前年份范围内的朝代，使用useMemo缓存结果避免每次渲染创建新数组
  const dynasties = useMemo(() => {
    return allDynasties.filter(
      (dynasty) => dynasty.startYear <= endYear && (dynasty.endYear || dynasty.startYear) >= startYear
    );
  }, [allDynasties, startYear, endYear]);

  // 处理朝代选择
  const handleSlideChange = (swiper: any) => {
    const activeIndex = swiper.activeIndex;
    const selectedDynasty = dynasties[activeIndex];
    if (selectedDynasty) {
      // 转换为UtilsDynasty格式以兼容store
      setSelectedDynasty(selectedDynasty as any);
    }
  };

  // 初始加载时默认选择第一个朝代
  React.useEffect(() => {
    if (dynasties.length > 0) {
      setSelectedDynasty(dynasties[0] as any);
    }
  }, [dynasties, setSelectedDynasty]);

  if (dynasties.length === 0) {
    return null;
  }

  return (
    <div className={className}  >
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
          autoplay={false}
          speed={120}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 150,
            modifier: 1,
            slideShadows: true,
          }}
          mousewheel={{
            invert: false,
            thresholdDelta: 10,
          }}
          modules={[EffectCoverflow, Mousewheel]}
          className="animate__animated animate__zoomIn"
          style={{
            width: '100%',
            height: '100%'
          }}
          onSlideChange={handleSlideChange}>
          {dynasties.map((dynasty) => (
            <SwiperSlide
              key={dynasty.id}
              style={{
                width: '140px',
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
              <DynastySlide dynasty={dynasty} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
