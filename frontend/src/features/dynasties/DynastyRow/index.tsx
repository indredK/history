/**
 * 朝代行组件 —— 标题行 + 可展开的统治者明细行
 *
 * 处理三种数据结构:
 *   1. dynasty.rulers           —— 普通朝代,直接平铺统治者
 *   2. dynasty.subDynasties     —— 南/北朝双层(可再嵌一层 dynasties)
 *   3. dynasty.dynasties        —— 五代特殊结构,顶层即子朝代列表
 */

import { memo, type ReactNode } from 'react';
import { DynastyHeaderRow } from './DynastyHeaderRow';
import { renderRulerRows } from './renderRulerRows';
import type { Dynasty, SubDynasty } from './types';

interface DynastyRowProps {
  dynasty: Dynasty;
  isExpanded: boolean;
  onToggle: (dynastyId: string) => void;
  isMobile?: boolean;
  isSmallMobile?: boolean;
}

export const DynastyRow = memo(
  ({ dynasty, isExpanded, onToggle, isMobile, isSmallMobile }: DynastyRowProps) => {
    const handleToggle = () => onToggle(dynasty.id);
    const rows: ReactNode[] = [];

    rows.push(
      <DynastyHeaderRow
        key={`${dynasty.id}-header`}
        dynasty={dynasty}
        isExpanded={isExpanded}
        onToggle={handleToggle}
        isMobile={isMobile}
        isSmallMobile={isSmallMobile}
      />
    );

    if (isExpanded) {
      // 五代:顶层即子朝代
      if (dynasty.dynasties) {
        dynasty.dynasties.forEach((subDynasty: SubDynasty) => {
          if (subDynasty.rulers) {
            rows.push(
              ...renderRulerRows({
                rulers: subDynasty.rulers,
                dynastyName: dynasty.name,
                subDynastyName: subDynasty.name,
                isMobile,
                isSmallMobile,
              })
            );
          }
        });
      }
      // 南朝/北朝:subDynasties(可再嵌一层 dynasties)
      else if (dynasty.subDynasties) {
        dynasty.subDynasties.forEach((subDynasty) => {
          if (subDynasty.dynasties) {
            subDynasty.dynasties.forEach((nested) => {
              if (nested.rulers) {
                rows.push(
                  ...renderRulerRows({
                    rulers: nested.rulers,
                    dynastyName: dynasty.name,
                    subDynastyName: `${subDynasty.name}-${nested.name}`,
                    isMobile,
                    isSmallMobile,
                  })
                );
              }
            });
          } else if (subDynasty.rulers) {
            rows.push(
              ...renderRulerRows({
                rulers: subDynasty.rulers,
                dynastyName: dynasty.name,
                subDynastyName: subDynasty.name,
                isMobile,
                isSmallMobile,
              })
            );
          }
        });
      }
      // 普通:直接 rulers
      else if (dynasty.rulers) {
        rows.push(
          ...renderRulerRows({
            rulers: dynasty.rulers,
            dynastyName: dynasty.name,
            isMobile,
            isSmallMobile,
          })
        );
      }
    }

    return <>{rows}</>;
  }
);

DynastyRow.displayName = 'DynastyRow';

export type { Dynasty, Ruler, SubDynasty, YearName, DynastyEvent } from './types';
