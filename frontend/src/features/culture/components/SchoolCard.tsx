/**
 * 思想流派卡片组件
 * School Card Component
 * 
 * 显示思想流派基本信息：名称、创始人、创立时期、简介
 * 
 * Requirements: 3.2, 3.3
 */

import { ContentCard, type ContentTagColor } from '@/components/common';
import type { PhilosophicalSchool } from '@/services/school/types';

interface SchoolCardProps {
  school: PhilosophicalSchool;
  onClick: () => void;
}

/**
 * 思想流派卡片组件
 */
export function SchoolCard({ school, onClick }: SchoolCardProps) {
  const schoolColor: ContentTagColor = {
    bg: `${school.color || '#9e9e9e'}15`,
    text: school.color || '#9e9e9e',
  };

  // 获取核心思想，优先使用coreBeliefs，兼容coreIdeas
  const coreBeliefs = school.coreBeliefs || school.coreIdeas || [];
  
  // 核心思想标签云
  const tagCloud = coreBeliefs.map(belief => ({
    label: belief,
    color: schoolColor,
  }));

  // 构建底部文本
  const representativeCount = school.representativeFigures?.length || 0;
  const classicWorksCount = school.classicWorks?.length || 0;
  const keyTextsCount = school.keyTexts?.length || 0;
  
  const footerText = `${school.founder || '未知创始人'} · ${representativeCount}位代表 · ${classicWorksCount || keyTextsCount}部著作`;

  return (
    <ContentCard
      title={school.name}
      subtitle={school.name_en || ''}
      icon={{
        char: school.name.charAt(0),
        color: school.color || 'var(--color-primary)',
      }}
      tagCloud={tagCloud}
      tagCloudMax={5}
      description={school.description || ''}
      footerText={footerText}
      onClick={onClick}
      minHeight={140}
    />
  );
}

export default SchoolCard;
