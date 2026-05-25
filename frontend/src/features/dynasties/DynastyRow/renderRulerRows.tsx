/**
 * 将统治者数组渲染为多行 React 节点
 *
 * 一个统治者可能有多个年号(`yearNames` 数组),此时按年号数拆成多行,
 * 首行用 rowSpan 跨列覆盖朝代/名号/姓名/大事记。
 */

import type React from 'react';
import { RulerRow } from './RulerRow';
import type { ResponsiveFlags, Ruler } from './types';

interface Options extends ResponsiveFlags {
  rulers: Ruler[];
  dynastyName: string;
  subDynastyName?: string;
}

export function renderRulerRows({
  rulers,
  dynastyName,
  subDynastyName,
  isMobile,
  isSmallMobile,
}: Options): React.ReactNode[] {
  const rows: React.ReactNode[] = [];

  rulers.forEach((ruler, rulerIndex) => {
    if (ruler.yearNames && ruler.yearNames.length > 0) {
      ruler.yearNames.forEach((yearName, yearIndex) => {
        const isFirstYearName = yearIndex === 0;
        rows.push(
          <RulerRow
            key={`${dynastyName}-${subDynastyName || ''}-${rulerIndex}-${yearIndex}`}
            ruler={ruler}
            dynastyName={dynastyName}
            subDynastyName={subDynastyName}
            yearName={yearName}
            isFirstYearName={isFirstYearName}
            rowSpan={ruler.yearNames!.length}
            isMobile={isMobile}
            isSmallMobile={isSmallMobile}
          />
        );
      });
    } else {
      rows.push(
        <RulerRow
          key={`${dynastyName}-${subDynastyName || ''}-${rulerIndex}`}
          ruler={ruler}
          dynastyName={dynastyName}
          subDynastyName={subDynastyName}
          isFirstYearName={true}
          rowSpan={1}
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
        />
      );
    }
  });

  return rows;
}
