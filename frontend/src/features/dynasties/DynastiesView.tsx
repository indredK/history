/**
 * 朝代页容器
 *
 * 提供唯一的 PagePanel 外壳 + 顶部 tab 切换：
 *  - 「年表明细」：虚拟化表格（常驻挂载，切走仅隐藏，保留状态、不重复加载）
 *  - 「时间轴」：甘特泳道图（懒挂载，避免 ECharts 在隐藏容器里以 0 宽初始化）
 */

import { useState } from 'react';
import { Box } from '@mui/material';
import { PagePanel, CommonTabs } from '@/components/common';
import type { CommonTabItem } from '@/components/common';
import { DynastiesListFlat } from './DynastiesListFlat';
import { DynastyGanttChart } from './gantt/DynastyGanttChart';

const TABS: CommonTabItem[] = [
  { value: 'table', label: '年表明细' },
  { value: 'timeline', label: '时间轴' },
];

export function DynastiesView() {
  const [tab, setTab] = useState<string>('table');

  return (
    <PagePanel
      title="朝代纪年"
      headerAside={
        <Box sx={{ ml: { md: 'auto' } }}>
          <CommonTabs
            tabs={TABS}
            value={tab}
            onChange={setTab}
            ariaLabel="朝代视图切换"
            showBorder={false}
          />
        </Box>
      }
      contentSx={{ minHeight: 0 }}
    >
      {/* 年表明细：常驻挂载，切走仅隐藏 */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          flexDirection: 'column',
          display: tab === 'table' ? 'flex' : 'none',
        }}
      >
        <DynastiesListFlat />
      </Box>

      {/* 时间轴：懒挂载 */}
      {tab === 'timeline' && (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <DynastyGanttChart />
        </Box>
      )}
    </PagePanel>
  );
}
