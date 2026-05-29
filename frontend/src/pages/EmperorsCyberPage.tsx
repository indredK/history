/**
 * 赛博朋克风格帝王卡片页面
 * Cyberpunk Emperor Cards Page
 *
 * 技术栈：Three.js (3D粒子背景) + anime.js (动画编排) + React
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { animate, stagger, createTimeline } from 'animejs';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Keyboard } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { loadJsonData } from '@/utils/services/dataLoaders';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import './EmperorsCyberPage.css';

// ─── 类型定义（与朝代 JSON 数据结构对齐） ─────────
interface DynastyConfig {
  id: string;
  name: string;
  period: string;
  dataFile: string;
}

interface RulerEvent {
  description: string;
  mapUrl?: string;
}

interface YearName {
  name: string;
  duration: string;
  startYear: string;
}

interface Ruler {
  title: string;
  name: string;
  yearNames?: YearName[];
  events?: RulerEvent[];
}

interface DynastyData {
  id: string;
  name: string;
  period: string;
  summary?: string;
  rulers?: Ruler[];
  subDynasties?: { id: string; name: string; period: string; rulers?: Ruler[] }[];
}

// ─── 赛博朋克配色方案（按朝代顺序循环分配） ─────────
const CYBER_COLORS = [
  '#00f0ff', '#ff2d55', '#ff9500', '#ffcc00', '#34c759',
  '#5ac8fa', '#ff3b30', '#af52de', '#5856d6', '#007aff',
  '#ff6b35', '#ffd60a', '#30d158', '#64d2ff', '#bf5af2',
  '#ff453a', '#32ade6', '#ac8e68', '#ff6482', '#66d4cf',
  '#ffd426', '#a2845e', '#ff375f', '#5e5ce6',
];

// ─── 朝代列表（动态加载后填充） ─────────────────────
interface DynastyItem {
  id: string;
  name: string;
  era: string;
  color: string;
}

// ─── 帝王数据（从 JSON rulers 转换） ─────────────────
interface CyberEmperor {
  id: string;
  name: string;
  title: string;
  dynasty: string;
  dynastyId: string;
  period: string;
  yearNames: string[];
  events: string[];
  summary: string;
}

// ─── 辅助函数 ───────────────────────────────────────
function getDynastyColor(dynastyId: string, dynasties: DynastyItem[]): string {
  return dynasties.find(d => d.id === dynastyId)?.color || '#00f0ff';
}

/** 从朝代 JSON 数据中提取所有 rulers（含 subDynasties） */
function extractRulers(dynasty: DynastyData): CyberEmperor[] {
  const results: CyberEmperor[] = [];
  const addRulers = (rulers: Ruler[] | undefined) => {
    if (!rulers) return;
    rulers.forEach((ruler, idx) => {
      results.push({
        id: `${dynasty.id}-${idx}`,
        name: ruler.name,
        title: ruler.title,
        dynasty: dynasty.name,
        dynastyId: dynasty.id,
        period: dynasty.period,
        yearNames: ruler.yearNames?.map(yn => yn.name).filter(Boolean) || [],
        events: ruler.events?.map(e => e.description).filter(Boolean) || [],
        summary: dynasty.summary || '',
      });
    });
  };
  addRulers(dynasty.rulers);
  dynasty.subDynasties?.forEach(sub => addRulers(sub.rulers));
  return results;
}

// ═══════════════════════════════════════════════════════
// Three.js 3D 粒子背景
// ═══════════════════════════════════════════════════════

/** 生成随机粒子位置 */
function generateParticlePositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  return positions;
}

/** 生成随机粒子颜色 */
function generateParticleColors(count: number): Float32Array {
  const colors = new Float32Array(count * 3);
  const palette = [
    [0, 0.94, 1],      // #00f0ff
    [1, 0.18, 0.33],   // #ff2d55
    [0.69, 0.32, 0.87],// #af52de
    [1, 0.8, 0],       // #ffcc00
    [0.2, 0.78, 0.35], // #34c759
  ];
  for (let i = 0; i < count; i++) {
    const c = palette[Math.floor(Math.random() * palette.length)]!;
    colors[i * 3] = c[0]!;
    colors[i * 3 + 1] = c[1]!;
    colors[i * 3 + 2] = c[2]!;
  }
  return colors;
}

/** Three.js 粒子场组件 */
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 600;
  const positions = useMemo(() => generateParticlePositions(count), []);
  const colors = useMemo(() => generateParticleColors(count), []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.03;
    pointsRef.current.rotation.x = Math.sin(t * 0.02) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
          args={[colors, 3]}
        />
      </bufferGeometry>
      <PointMaterial
        transparent
        vertexColors
        size={0.04}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** 3D 连线网格（赛博感） */
function CyberGrid() {
  const linesRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const gridSize = 20;
    const divisions = 20;
    const step = gridSize / divisions;
    const half = gridSize / 2;

    for (let i = 0; i <= divisions; i++) {
      const pos = -half + i * step;
      // X 方向线
      vertices.push(-half, 0, pos, half, 0, pos);
      // Z 方向线
      vertices.push(pos, 0, -half, pos, 0, half);
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (!linesRef.current) return;
    const t = state.clock.getElapsedTime();
    linesRef.current.position.y = -5 + Math.sin(t * 0.5) * 0.3;
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial
        color="#00f0ff"
        transparent
        opacity={0.06}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

/** Three.js 背景场景 */
function ThreeBackground() {
  return (
    <div className="cyber-three-bg">
      <Canvas
        camera={{ position: [0, 2, 10], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <ParticleField />
        <CyberGrid />
      </Canvas>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 扫描线（保留 CSS，轻量）
// ═══════════════════════════════════════════════════════
function Scanlines() {
  return (
    <div className="cyber-scanlines">
      <div className="cyber-scanline-bar" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 帝王卡片（anime.js 驱动动画）
// ═══════════════════════════════════════════════════════
interface EmperorCardProps {
  emperor: CyberEmperor;
  index: number;
  isActive: boolean;
  onClick: () => void;
  animKey: number; // 用于触发 anime 入场动画
  color: string; // 由父组件计算好的朝代颜色
}

function EmperorCard({ emperor, index, isActive, onClick, animKey, color }: EmperorCardProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);

  // anime.js v4 入场动画
  useEffect(() => {
    if (!cardRef.current) return;
    animate(cardRef.current, {
      opacity: [0, isActive ? 1 : 0.5],
      translateX: isActive ? ['5rem', '0rem'] : ['2.5rem', '0rem'],
      rotateY: ['25deg', '0deg'],
      scale: [0.85, isActive ? 1 : 0.92],
      duration: 600,
      delay: index === 0 ? 0 : Math.abs(index) * 100,
      ease: 'outCubic',
    });

    // 标签逐个入场
    if (tagsRef.current) {
      animate(tagsRef.current.children, {
        opacity: [0, 1],
        translateY: ['0.625rem', '0rem'],
        delay: stagger(60, { start: 300 }),
        duration: 400,
        ease: 'outQuad',
      });
    }
  }, [animKey, isActive, index]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
    // anime.js v4 回弹
    if (cardRef.current && isActive) {
      animate(cardRef.current, {
        rotateX: '0deg',
        rotateY: '0deg',
        duration: 400,
        ease: 'outElastic(1, .6)',
      });
    }
  }, [isActive]);

  // 鼠标跟随 3D 倾斜（anime.js v4 平滑插值）
  useEffect(() => {
    if (!cardRef.current || !isActive) return;
    animate(cardRef.current, {
      rotateX: `${mousePos.y * -15}deg`,
      rotateY: `${mousePos.x * 15}deg`,
      duration: 300,
      ease: 'outQuad',
    });
  }, [mousePos, isActive]);

  // Glitch 效果（anime.js v4 timeline）
  useEffect(() => {
    if (!isActive || !cardRef.current) return;
    const interval = setInterval(() => {
      if (!cardRef.current) return;
      const tl = createTimeline();
      tl.add(cardRef.current, { translateX: ['-0.125rem', '0rem'], duration: 50, ease: 'outQuad' })
        .add(cardRef.current, { translateX: ['0.0625rem', '0rem'], duration: 50, ease: 'outQuad' }, 80);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div
      ref={cardRef}
      className={`cyber-emperor-card ${isActive ? 'active' : ''}`}
      style={{
        '--card-color': color,
        opacity: 0,
      } as React.CSSProperties}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 赛博边框装饰 */}
      <div className="cyber-card-border" style={{ borderColor: color }}>
        <div className="cyber-card-corner cyber-card-corner--tl" style={{ borderColor: color }} />
        <div className="cyber-card-corner cyber-card-corner--tr" style={{ borderColor: color }} />
        <div className="cyber-card-corner cyber-card-corner--bl" style={{ borderColor: color }} />
        <div className="cyber-card-corner cyber-card-corner--br" style={{ borderColor: color }} />
      </div>

      {/* 卡片内容 */}
      <div className="cyber-card-content">
        <div className="cyber-card-dynasty-tag" style={{ borderColor: color, color }}>
          {emperor.dynasty}
        </div>

        <div className="cyber-card-avatar" style={{ boxShadow: `0 0 30px ${color}40, inset 0 0 20px ${color}20` }}>
          <div className="cyber-card-avatar-placeholder" style={{ borderColor: color }}>
            <span style={{ color }}>{emperor.name.charAt(0)}</span>
          </div>
          <div className="cyber-card-holo-scan" style={{ background: `linear-gradient(180deg, transparent, ${color}30, transparent)` }} />
        </div>

        <h3 className="cyber-card-name" style={{ textShadow: `0 0 20px ${color}80` }}>
          {emperor.name}
        </h3>
        {emperor.title && (
          <div className="cyber-card-temple" style={{ color }}>
            {emperor.title}
          </div>
        )}

        <div className="cyber-card-reign" style={{ color }}>
          {emperor.period}
        </div>

        <div ref={tagsRef} className="cyber-card-tags">
          {emperor.events.slice(0, 3).map((ev, i) => (
            <span key={i} className="cyber-card-tag" style={{ borderColor: `${color}60`, color: `${color}cc`, opacity: 0 }}>
              {ev}
            </span>
          ))}
        </div>

        <div className="cyber-card-bottom-line" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      </div>

      {isActive && (
        <div className="cyber-card-glitch" style={{ '--card-color': color } as React.CSSProperties}>
          <div className="cyber-card-glitch-layer cyber-card-glitch-layer--r" />
          <div className="cyber-card-glitch-layer cyber-card-glitch-layer--b" />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 帝王详情面板（anime.js 驱动）
// ═══════════════════════════════════════════════════════
interface EmperorDetailProps {
  emperor: CyberEmperor;
  onClose: () => void;
  color: string; // 由父组件计算好的朝代颜色
}

function EmperorDetail({ emperor, onClose, color }: EmperorDetailProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // anime.js v4 入场
    if (overlayRef.current) {
      animate(overlayRef.current, { opacity: [0, 1], duration: 300, ease: 'outQuad' });
    }
    if (panelRef.current) {
      animate(panelRef.current, {
        opacity: [0, 1],
        scale: [0.9, 1],
        translateY: ['1.875rem', '0rem'],
        duration: 500,
        ease: 'outCubic',
      });
    }
    // 各段落逐个入场
    if (sectionsRef.current) {
      animate(sectionsRef.current.querySelectorAll('.cyber-detail-section'), {
        opacity: [0, 1],
        translateY: ['1.25rem', '0rem'],
        delay: stagger(100, { start: 200 }),
        duration: 400,
        ease: 'outQuad',
      });
    }
  }, []);

  const handleClose = useCallback(() => {
    if (panelRef.current) {
      animate(panelRef.current, {
        opacity: 0,
        scale: 0.95,
        translateY: '1.25rem',
        duration: 250,
        ease: 'inQuad',
        complete: onClose,
      });
    } else {
      onClose();
    }
  }, [onClose]);

  return (
    <div ref={overlayRef} className="cyber-detail-overlay" style={{ opacity: 0 }} onClick={handleClose}>
      <div
        ref={panelRef}
        className="cyber-detail-panel"
        onClick={e => e.stopPropagation()}
        style={{ '--detail-color': color, opacity: 0 } as React.CSSProperties}
      >
        <button className="cyber-detail-close" onClick={handleClose} style={{ color }}>✕</button>

        <div className="cyber-detail-header">
          <div className="cyber-detail-avatar" style={{ borderColor: color, boxShadow: `0 0 40px ${color}40` }}>
            <span style={{ color }}>{emperor.name.charAt(0)}</span>
          </div>
          <div className="cyber-detail-title-group">
            <h2 className="cyber-detail-name" style={{ color, textShadow: `0 0 30px ${color}60` }}>
              {emperor.name}
            </h2>
            <div className="cyber-detail-meta">
              {emperor.title && <span style={{ color }}>{emperor.title}</span>}
            </div>
            <div className="cyber-detail-dynasty-reign" style={{ color }}>
              {emperor.dynasty} · {emperor.period}
            </div>
          </div>
        </div>

        <div ref={sectionsRef}>
          {emperor.summary && (
            <div className="cyber-detail-section" style={{ opacity: 0 }}>
              <h4 className="cyber-detail-section-title" style={{ color }}>简介</h4>
              <p className="cyber-detail-bio">{emperor.summary}</p>
            </div>
          )}

          {emperor.yearNames.length > 0 && (
            <div className="cyber-detail-section" style={{ opacity: 0 }}>
              <h4 className="cyber-detail-section-title" style={{ color }}>年号</h4>
              <div className="cyber-detail-eras">
                {emperor.yearNames.map((yn, i) => (
                  <div key={i} className="cyber-detail-era-chip" style={{ borderColor: `${color}50` }}>
                    <span className="cyber-detail-era-name" style={{ color }}>{yn}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {emperor.events.length > 0 && (
            <div className="cyber-detail-section" style={{ opacity: 0 }}>
              <h4 className="cyber-detail-section-title" style={{ color }}>重要事件</h4>
              <ul className="cyber-detail-list cyber-detail-list--success">
                {emperor.events.map((ev, i) => <li key={i}>{ev}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 朝代卡片选择器（Swiper Coverflow 驱动）
// ═══════════════════════════════════════════════════════
interface DynastySelectorProps {
  dynasties: DynastyItem[];
  activeDynasty: string;
  onSelect: (dynastyId: string) => void;
  emperorCounts: Record<string, number>;
}

function DynastySelector({ dynasties, activeDynasty, onSelect, emperorCounts }: DynastySelectorProps) {
  const selectorSwiperRef = useRef<SwiperType | null>(null);
  const activeIndex = useMemo(
    () => dynasties.findIndex((dynasty) => dynasty.id === activeDynasty),
    [activeDynasty, dynasties],
  );
  const loopEnabled = dynasties.length > 2;

  const goToIndex = useCallback((targetIndex: number) => {
    const swiper = selectorSwiperRef.current;
    const targetDynasty = dynasties[targetIndex];
    if (!targetDynasty) return;

    if (swiper) {
      if (loopEnabled) {
        swiper.slideToLoop(targetIndex, 450);
      } else {
        swiper.slideTo(targetIndex, 450);
      }
    }

    if (targetDynasty.id !== activeDynasty) {
      onSelect(targetDynasty.id);
    }
  }, [activeDynasty, dynasties, loopEnabled, onSelect]);

  useEffect(() => {
    const swiper = selectorSwiperRef.current;
    if (!swiper || activeIndex < 0) return;

    if (loopEnabled) {
      if (swiper.realIndex !== activeIndex) {
        swiper.slideToLoop(activeIndex, 450, false);
      }
      return;
    }

    if (swiper.activeIndex !== activeIndex) {
      swiper.slideTo(activeIndex, 450, false);
    }
  }, [activeIndex, loopEnabled]);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    const nextIndex = loopEnabled ? swiper.realIndex : swiper.activeIndex;
    const nextDynasty = dynasties[nextIndex];
    if (nextDynasty && nextDynasty.id !== activeDynasty) {
      onSelect(nextDynasty.id);
    }
  }, [activeDynasty, dynasties, loopEnabled, onSelect]);

  const handleCardClick = useCallback((index: number, dynastyId: string) => {
    if (dynastyId === activeDynasty && selectorSwiperRef.current) {
      goToIndex(index);
      return;
    }

    goToIndex(index);
  }, [activeDynasty, goToIndex]);

  return (
    <div className="cyber-dynasty-selector">
      <Swiper
        className="cyber-dynasty-swiper"
        modules={[Keyboard]}
        slidesPerView="auto"
        spaceBetween={8}
        slideToClickedSlide
        grabCursor
        watchSlidesProgress
        loop={loopEnabled}
        loopAdditionalSlides={dynasties.length}
        speed={320}
        keyboard={{ enabled: true }}
        onSwiper={(swiper) => {
          selectorSwiperRef.current = swiper;
        }}
        onSlideChange={handleSlideChange}
      >
        {dynasties.map((dynasty, index) => {
          const count = emperorCounts[dynasty.id] || 0;

          return (
            <SwiperSlide key={dynasty.id} className="cyber-dynasty-slide">
              <button
                type="button"
                className="cyber-dynasty-card"
                style={{ '--card-accent': dynasty.color } as React.CSSProperties}
                onClick={() => handleCardClick(index, dynasty.id)}
                aria-pressed={dynasty.id === activeDynasty}
                aria-label={`切换到${dynasty.name}`}
              >
                <span className="cyber-dynasty-card-frame" aria-hidden="true" />
                <span className="cyber-dynasty-card-name">{dynasty.name}</span>
                <span className="cyber-dynasty-card-era">{dynasty.era}</span>
                <span className="cyber-dynasty-card-count">{count > 0 ? `${count}位帝王` : '暂无数据'}</span>
                <span className="cyber-dynasty-card-indicator" aria-hidden="true" />
              </button>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div className="cyber-selector-label">
        <span className="cyber-selector-label-text">SELECT DYNASTY</span>
        <div className="cyber-selector-label-line" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 主页面
// ═══════════════════════════════════════════════════════
export default function EmperorsCyberPage() {
  const [dynasties, setDynasties] = useState<DynastyItem[]>([]);
  const [emperors, setEmperors] = useState<CyberEmperor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDynastyId, setActiveDynastyId] = useState('');
  const [activeEmperorIndex, setActiveEmperorIndex] = useState(0);
  const [selectedEmperor, setSelectedEmperor] = useState<CyberEmperor | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  // 加载朝代与帝王数据
  useEffect(() => {
    async function loadData() {
      try {
        const config = await loadJsonData<{ dynasties: DynastyConfig[] }>('/data/json/chinese-dynasties.json');
        if (!config) return;
        const dynastyItems: DynastyItem[] = config.dynasties.map((d, i) => ({
          id: d.id,
          name: d.name,
          era: d.period,
          color: CYBER_COLORS[i % CYBER_COLORS.length] ?? '#00f0ff',
        }));
        setDynasties(dynastyItems);

        // 设置默认选中第一个朝代
        if (dynastyItems.length > 0) {
          setActiveDynastyId(dynastyItems[0]!.id);
        }

        // 加载所有朝代的 rulers
        const allEmperors: CyberEmperor[] = [];
        for (const dc of config.dynasties) {
          const data = await loadJsonData<DynastyData>(`/data/json/${dc.dataFile}`);
          if (data) allEmperors.push(...extractRulers(data));
        }
        setEmperors(allEmperors);
      } catch (err) {
        console.error('Failed to load dynasty data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 筛选当前朝代帝王（按 dynastyId 精确匹配）
  const filteredEmperors = useMemo(() => {
    return emperors.filter(e => e.dynastyId === activeDynastyId);
  }, [emperors, activeDynastyId]);

  // 统计各朝代帝王数量（按 dynastyId）
  const emperorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    emperors.forEach(e => {
      counts[e.dynastyId] = (counts[e.dynastyId] || 0) + 1;
    });
    return counts;
  }, [emperors]);

  // 当前选中朝代的名称（用于显示）
  const activeDynastyName = useMemo(() => {
    return dynasties.find(d => d.id === activeDynastyId)?.name || '';
  }, [dynasties, activeDynastyId]);

  // 当前选中朝代的颜色
  const activeColor = getDynastyColor(activeDynastyId, dynasties);

  // 切换朝代时重置 Swiper 到第一张
  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(0, 0);
    }
    setActiveEmperorIndex(0);
  }, [activeDynastyId]);

  // 键盘导航（Escape 关闭详情）
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selectedEmperor && e.key === 'Escape') setSelectedEmperor(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedEmperor]);

  // 标题切换朝代时的 anime v4 动画
  const titleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (titleRef.current) {
      animate(titleRef.current, {
        opacity: [0.3, 1],
        translateY: ['-0.3125rem', '0rem'],
        duration: 400,
        ease: 'outQuad',
      });
    }
  }, [activeDynastyId]);

  return (
    <div className="cyber-emperors-page">
      {/* Three.js 3D 背景层 */}
      <ThreeBackground />
      <Scanlines />

      {/* 顶部标题 */}
      <header className="cyber-header">
        <div className="cyber-header-deco" style={{ background: `linear-gradient(90deg, transparent, ${activeColor}40, transparent)` }} />
        <h1 className="cyber-title">
          <span className="cyber-title-en">EMPERORS</span>
          <span className="cyber-title-cn" style={{ color: activeColor }}>帝王录</span>
        </h1>
        <div ref={titleRef} className="cyber-header-subtitle">
          <span className="cyber-header-dynasty" style={{ color: activeColor }}>
            {activeDynastyName}
          </span>
          <span className="cyber-header-divider">|</span>
          <span className="cyber-header-count">
            {filteredEmperors.length} 位帝王
          </span>
        </div>
        <div className="cyber-header-deco" style={{ background: `linear-gradient(90deg, transparent, ${activeColor}40, transparent)` }} />
      </header>

      {/* 卡片展示区 */}
      <main className="cyber-card-stage">
        {loading ? (
          <div className="cyber-loading">
            <div className="cyber-loading-spinner" style={{ borderColor: activeColor }} />
            <span style={{ color: activeColor }}>LOADING...</span>
          </div>
        ) : filteredEmperors.length === 0 ? (
          <div className="cyber-empty">
            <div className="cyber-empty-icon" style={{ color: activeColor }}>⊘</div>
            <p>该朝代暂无帝王数据</p>
          </div>
        ) : (
          <Swiper
            className="cyber-swiper"
            modules={[EffectCoverflow, Navigation, Keyboard]}
            effect="coverflow"
            coverflowEffect={{
              rotate: 30,
              stretch: 0,
              depth: 200,
              modifier: 1,
              slideShadows: true,
            }}
            navigation
            keyboard={{ enabled: true }}
            centeredSlides
            slidesPerView="auto"
            spaceBetween={30}
            speed={600}
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
            onSlideChange={(swiper) => {
              const idx = swiper.activeIndex;
              setActiveEmperorIndex(idx);
              if (filteredEmperors[idx]) {
                setSelectedEmperor(null);
              }
            }}
          >
            {filteredEmperors.map((emperor, i) => (
              <SwiperSlide key={emperor.id} className="cyber-swiper-slide">
                <EmperorCard
                  emperor={emperor}
                  index={i - activeEmperorIndex}
                  isActive={i === activeEmperorIndex}
                  animKey={i}
                  color={getDynastyColor(emperor.dynastyId, dynasties)}
                  onClick={() => setSelectedEmperor(emperor)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </main>

      <DynastySelector
        dynasties={dynasties}
        activeDynasty={activeDynastyId}
        onSelect={setActiveDynastyId}
        emperorCounts={emperorCounts}
      />

      {selectedEmperor && (
        <EmperorDetail
          emperor={selectedEmperor}
          onClose={() => setSelectedEmperor(null)}
          color={getDynastyColor(selectedEmperor.dynastyId, dynasties)}
        />
      )}
    </div>
  );
}
