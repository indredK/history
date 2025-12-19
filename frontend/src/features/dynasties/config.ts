// 表格列配置接口
export interface ColumnConfig {
  key: string;
  label: string;
  width?: string;
  minWidth?: string;
  align?: 'left' | 'center' | 'right' | 'inherit' | 'justify';
  isLast?: boolean;
}

// 表格列配置
export const columns: ColumnConfig[] = [
  { key: 'dynasty', label: '朝代', width: '120px', align: 'center' },
  { key: 'title', label: '名号', width: '90px', align: 'center' },
  { key: 'name', label: '姓名', width: '110px', align: 'center' },
  { key: 'yearName', label: '年号', width: '90px', align: 'center' },
  { key: 'duration', label: '使用年数', width: '80px', align: 'center' },
  { key: 'ganZhi', label: '元年干支', width: '80px', align: 'center' },
  { key: 'changeMonth', label: '改元月份', width: '90px', align: 'center' },
  { key: 'startYear', label: '公元纪年', width: '110px', align: 'center' },
  { key: 'events', label: '大事记/歷史地圖', minWidth: '300px', align: 'center', isLast: true }
];

// 通用样式配置
export const tableStyles = {
  // 表头样式
  headerCell: {
    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    color: 'white',
    fontWeight: 'bold',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    py: 0.8,
    fontSize: '0.8rem',
    textAlign: 'center'
  },
  
  // 表格单元格样式
  bodyCell: {
    py: 0.4,
    px: 1,
    fontSize: '0.75rem'
  },
  
  // 朝代列样式
  dynastyCell: {
    borderRight: '2px solid #e3f2fd',
    verticalAlign: 'top'
  },
  
  // 表格行样式
  tableRow: {
    '&:hover': { backgroundColor: '#f8f9fa' },
    '&:nth-of-type(even)': { backgroundColor: '#fafafa' }
  },
  
  // 朝代名称样式
  dynastyName: {
    fontWeight: 'bold', 
    mb: 0.2,
    color: '#2e7d32',
    fontSize: '0.75rem',
    lineHeight: 1.1
  },
  
  // 朝代时期样式
  dynastyPeriod: {
    color: '#666',
    fontSize: '0.65rem',
    fontStyle: 'italic',
    lineHeight: 1
  },
  
  // 帝王名号样式
  rulerTitle: {
    fontWeight: 'bold',
    color: '#1565c0'
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
  
  // 地图图标按钮样式
  mapIconButton: {
    p: 0.2,
    minWidth: 'auto',
    width: 24,
    height: 24,
    color: '#1976d2',
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    borderRadius: '4px',
    flexShrink: 0,
    '&:hover': {
      backgroundColor: '#e3f2fd',
      transform: 'scale(1.1)'
    }
  },
  
  // 事件容器样式
  eventContainer: {
    mb: 0.3, 
    display: 'flex', 
    alignItems: 'center',
    gap: 0.5
  },
  
  // 朝代标题行样式
  dynastyHeaderRow: {
    backgroundColor: '#f5f5f5',
    borderLeft: '4px solid #1976d2',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: '#e8f5e8',
      borderLeftColor: '#1565c0',
      transform: 'translateX(1px)'
    }
  },
  
  // 朝代标题单元格样式
  dynastyHeaderCell: {
    backgroundColor: '#e8f5e8',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: '#d4edda',
      transform: 'translateX(2px)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }
  },
  
  // 展开/收起图标样式
  expandIcon: {
    transition: 'transform 0.2s ease-in-out',
    color: '#1976d2'
  }
};

// 表格配置
export const tableConfig = {
  minWidth: 1400,
  containerHeight: '85vh',
  containerStyles: {
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    overflow: 'auto',
    borderRadius: 2,
    border: '1px solid #e0e0e0'
  }
};

// 加载状态配置
export const loadingConfig = {
  containerHeight: '85vh',
  containerStyles: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 4
  }
};