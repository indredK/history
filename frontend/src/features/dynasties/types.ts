// API返回的年份行数据结构
export interface YearRowData {
  id: string;
  year: number;
  polity: string;
  ruler: string;
  rulerAlias: string;
  eraName: string;
  eraYearNo: string;
  eraYearText: string;
  eraFullName: string;
  sexagenary: string;
}

// API响应结构
export interface ApiResponse {
  yearRows: YearRowData[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
  };
}

// 表格显示的行数据
export interface TableRowData {
  id: string;
  dynasty: string;      // polity
  title: string;        // rulerAlias
  name: string;         // ruler
  yearName: string;     // eraFullName
  duration: string;     // eraYearNo
  ganZhi: string;       // sexagenary
  startYear: string;    // year
}
