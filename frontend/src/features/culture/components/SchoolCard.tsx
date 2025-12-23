/**
 * 思想流派卡片组件
 * School Card Component
 * 
 * 显示思想流派基本信息：名称、创始人、创立时期、简介
 * 
 * Requirements: 3.2, 3.3
 */

import { ContentCard, type ContentTagColor } from '@/components/common';
import type { PhilosophicalSchool } from '@/services/schools/types';

interface SchoolCardProps {
  school: PhilosophicalSchool;
  onClick: () => void;
}

/**
 * 思想流派卡片组件
 */
export function SchoolCard({ school, onClick }: SchoolCardProps) {
  const schoolColor: ContentTagColor = {
    bg: `${school.color}15` || 'rgba(158, 158, 158, 0.1)',
    text: school.color || '#9e9e9e',
  };

  // 核心思想标签云
  const tagCloud = school.coreIdeas.map(idea => ({
    label: idea,
    color: schoolColor,
  }));

  return (
    <ContentCard
      title={school.name}
      subtitle={school.name_en}
      icon={{
        char: school.name.charAt(0),
        color: school.color || 'var(--color-primary)',
      }}
      tagCloud={tagCloud}
      tagCloudMax={5}
      description={school.description}
      footerText={`${school.representativeFigures.length}位代表 · ${school.classicWorks.length}部著作`}
      onClick={onClick}
      minHeight={140}
    />
  );
}

export default SchoolCard;
