// 表格列配置接口
export interface ColumnConfig {
  key: string;
  label: string;
  mobileLabel?: string; // 移动端显示的标签
  width?: string;
  minWidth?: string;
  align?: 'left' | 'center' | 'right' | 'inherit' | 'justify';
  isLast?: boolean;
  hideOnMobile?: boolean; // 在移动端隐藏
  hideOnSmallMobile?: boolean; // 在小屏手机上隐藏
  priority?: 'high' | 'medium' | 'low'; // 显示优先级
  responsive?: boolean; // 是否启用响应式
}

// 表格列配置
export const columns: ColumnConfig[] = [
  { 
    key: 'dynasty', 
    label: '朝代', 
    mobileLabel: '朝代',
    width: '120px', 
    minWidth: '80px',
    align: 'center',
    priority: 'high',
    responsive: true
  },
  { 
    key: 'title', 
    label: '名号', 
    mobileLabel: '名号',
    width: '90px', 
    minWidth: '60px',
    align: 'center',
    hideOnSmallMobile: true, // 小屏手机隐藏
    priority: 'medium',
    responsive: true
  },
  { 
    key: 'name', 
    label: '姓名', 
    mobileLabel: '姓名',
    width: '110px', 
    minWidth: '70px',
    align: 'center',
    priority: 'high',
    responsive: true
  },
  { 
    key: 'yearName', 
    label: '年号', 
    mobileLabel: '年号',
    width: '90px', 
    minWidth: '60px',
    align: 'center',
    hideOnSmallMobile: true, // 小屏手机隐藏
    priority: 'medium',
    responsive: true
  },
  { 
    key: 'duration', 
    label: '使用年数', 
    mobileLabel: '年数',
    width: '80px', 
    minWidth: '50px',
    align: 'center',
    hideOnMobile: true, // 移动端隐藏
    priority: 'low',
    responsive: true
  },
  { 
    key: 'ganZhi', 
    label: '元年干支', 
    mobileLabel: '干支',
    width: '80px', 
    minWidth: '50px',
    align: 'center',
    hideOnMobile: true, // 移动端隐藏
    priority: 'low',
    responsive: true
  },
  { 
    key: 'changeMonth', 
    label: '改元月份', 
    mobileLabel: '月份',
    width: '90px', 
    minWidth: '50px',
    align: 'center',
    hideOnMobile: true, // 移动端隐藏
    priority: 'low',
    responsive: true
  },
  { 
    key: 'startYear', 
    label: '公元纪年', 
    mobileLabel: '纪年',
    width: '110px', 
    minWidth: '80px',
    align: 'center',
    priority: 'high',
    responsive: true
  },
  { 
    key: 'events', 
    label: '大事记/歷史地圖', 
    mobileLabel: '大事记',
    minWidth: '200px', 
    align: 'center', 
    isLast: true,
    priority: 'medium',
    responsive: true
  }
];

// 通用样式配置 - 毛玻璃风格
// Requirements: 8.1, 8.2, 8.3
export const tableStyles = {
  // 表头样式 - 毛玻璃效果
  headerCell: {
    background: 'rgba(255, 61, 0, 0.85)',
    backdropFilter: 'blur(var(--glass-table-header-blur, 16px))',
    WebkitBackdropFilter: 'blur(var(--glass-table-header-blur, 16px))',
    color: 'white',
    fontWeight: 'bold',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    py: 0.8,
    fontSize: '0.8rem',
    textAlign: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  
  // 表格单元格样式 - 毛玻璃效果
  bodyCell: {
    py: 0.4,
    px: 1,
    fontSize: '0.75rem',
    backgroundColor: 'var(--theme-glass-bg-light)',
    borderBottom: '1px solid var(--theme-glass-border)',
    transition: 'background-color var(--glass-duration-hover, 150ms) var(--glass-easing, cubic-bezier(0.4, 0, 0.2, 1))',
    color: 'var(--color-text-primary)'
  },
  
  // 朝代列样式 - 毛玻璃效果
  dynastyCell: {
    borderRight: '1px solid var(--theme-glass-border)',
    verticalAlign: 'top',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)'
  },
  
  // 表格行样式 - 毛玻璃悬停效果
  tableRow: {
    backgroundColor: 'var(--theme-glass-bg-light)',
    transition: 'all var(--glass-duration-hover, 150ms) var(--glass-easing, cubic-bezier(0.4, 0, 0.2, 1))',
    '&:hover': { 
      backgroundColor: 'var(--theme-glass-bg)',
      boxShadow: 'var(--theme-shadow-sm)'
    },
    '&:nth-of-type(even)': { 
      backgroundColor: 'var(--theme-glass-bg)'
    }
  },
  
  // 朝代名称样式
  dynastyName: {
    fontWeight: 'bold', 
    mb: 0.2,
    color: 'var(--color-primary)',
    fontSize: '0.75rem',
    lineHeight: 1.1,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
  },
  
  // 朝代时期样式
  dynastyPeriod: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.65rem',
    fontStyle: 'italic',
    lineHeight: 1
  },
  
  // 帝王名号样式
  rulerTitle: {
    fontWeight: 'bold',
    color: 'var(--color-primary)'
  },
  
  // 公元纪年样式
  startYear: {
    fontWeight: 'medium'
  },
  
  // 事件描述样式
  eventDescription: {
    fontSize: '0.7rem',
    lineHeight: 1.2,
    flex: 1,
    wordBreak: 'break-word'
  },
  
  // 地图图标按钮样式 - 毛玻璃效果
  mapIconButton: {
    p: 0.2,
    minWidth: 'auto',
    width: 24,
    height: 24,
    color: 'var(--color-primary)',
    backgroundColor: 'rgba(255, 61, 0, 0.15)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    borderRadius: '6px',
    border: '1px solid rgba(255, 61, 0, 0.2)',
    flexShrink: 0,
    transition: 'all var(--glass-duration-hover, 150ms) var(--glass-easing, cubic-bezier(0.4, 0, 0.2, 1))',
    '&:hover': {
      backgroundColor: 'rgba(255, 61, 0, 0.25)',
      transform: 'scale(1.1)',
      boxShadow: '0 0 12px rgba(255, 61, 0, 0.3)'
    }
  },
  
  // 事件容器样式
  eventContainer: {
    mb: 0.3, 
    display: 'flex', 
    alignItems: 'center',
    gap: 0.5
  },
  
  // 朝代标题行样式 - 毛玻璃效果
  dynastyHeaderRow: {
    backgroundColor: 'var(--theme-glass-bg)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderLeft: '4px solid var(--color-primary)',
    cursor: 'pointer',
    transition: 'all var(--glass-duration-normal, 250ms) var(--glass-easing, cubic-bezier(0.4, 0, 0.2, 1))',
    '&:hover': {
      backgroundColor: 'var(--theme-glass-bg-heavy)',
      borderLeftColor: 'var(--color-primary-dark)',
      transform: 'translateX(2px)',
      boxShadow: 'var(--theme-shadow-md)'
    }
  },
  
  // 朝代标题单元格样式 - 毛玻璃效果
  dynastyHeaderCell: {
    backgroundColor: 'var(--theme-glass-bg-light)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all var(--glass-duration-normal, 250ms) var(--glass-easing, cubic-bezier(0.4, 0, 0.2, 1))',
    '&:hover': {
      backgroundColor: 'var(--theme-glass-bg)',
      transform: 'translateX(2px)',
      boxShadow: 'var(--theme-shadow-sm)'
    }
  },
  
  // 展开/收起图标样式
  expandIcon: {
    transition: 'transform var(--glass-duration-normal, 250ms) var(--glass-easing, cubic-bezier(0.4, 0, 0.2, 1))',
    color: 'var(--color-primary)'
  }
};

// 表格配置 - 毛玻璃风格
// Requirements: 8.1
export const tableConfig = {
  minWidth: 1400,
  containerStyles: {
    boxShadow: 'var(--glass-shadow-md, 0 4px 16px rgba(0, 0, 0, 0.12))',
    overflow: 'auto',
    borderRadius: 'var(--glass-radius-lg, 16px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    backdropFilter: 'blur(var(--glass-table-container-blur, 12px))',
    WebkitBackdropFilter: 'blur(var(--glass-table-container-blur, 12px))',
    backgroundColor: 'rgba(255, 255, 255, var(--glass-table-container-bg-opacity, 0.5))'
  }
};

// 加载状态配置
export const loadingConfig = {
  containerStyles: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 4,
    height: '100%' // 使用100%高度而不是固定高度
  }
};