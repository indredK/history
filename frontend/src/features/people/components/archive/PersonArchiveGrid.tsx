import type { CommonPerson } from '@/services/person/common';
import { FigureGrid } from '../common';
import { PersonArchiveCard } from './PersonArchiveCard';

interface PersonArchiveGridProps {
  persons: CommonPerson[];
  loading: boolean;
  onPersonClick: (person: CommonPerson) => void;
  onPersonEdit: (person: CommonPerson) => void;
  onPersonDelete: (person: CommonPerson) => void;
}

export function PersonArchiveGrid({
  persons,
  loading,
  onPersonClick,
  onPersonEdit,
  onPersonDelete,
}: PersonArchiveGridProps) {
  return (
    <FigureGrid
      items={persons}
      loading={loading}
      emptyTitle="没有找到匹配的人物档案"
      renderCard={(person) => (
        <PersonArchiveCard
          person={person}
          onClick={onPersonClick}
          onEdit={onPersonEdit}
          onDelete={onPersonDelete}
        />
      )}
      keyExtractor={(person) => person.id}
    />
  );
}

export default PersonArchiveGrid;
