/**
 * 神话页面
 * Mythology Page
 */

import { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import SearchIcon from '@mui/icons-material/Search';
import { useRequest } from 'ahooks';

import { useMythologyStore } from '@/store/mythologyStore';
import {
  createMythology,
  deleteMythology,
  getMythologies,
  updateMythology,
  VALID_CATEGORIES,
  type Mythology,
  type MythologyCategory,
  type MythologyInput,
} from '@/services/mythology';
import { useCollectionResource } from '@/hooks';
import { FixedTabsPage, type FixedTabConfig } from '@/components/common';
import { StateView } from '@/components/ui';
import { CategoryFilter } from './components/CategoryFilter';
import { MythologyFormDialog } from './components/MythologyFormDialog';
import { MythologyGrid } from './components/MythologyGrid';
import { MythologyDetailModal } from './components/MythologyDetailModal';
import { ReligionGraph } from './components/ReligionGraph';
import './MythologyPage.scss';

type FormMode = 'create' | 'edit';

function LoadingSkeleton() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: { xs: 2, sm: 2, md: 2.5 },
      }}
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <Box
          key={index}
          className="glass-card-dark"
          sx={{
            p: 2,
            borderRadius: 'var(--radius-unified-md)',
            minHeight: 190,
          }}
        >
          <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width={80} height={24} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function matchesQuery(mythology: Mythology, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const haystack = [
    mythology.title,
    mythology.englishTitle,
    mythology.description,
    mythology.source,
    mythology.period,
    mythology.category,
    ...(mythology.characters || []),
    ...(mythology.stories || []),
    ...(mythology.symbolism || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

function buildCounts(mythologies: Mythology[]) {
  return mythologies.reduce<Partial<Record<MythologyCategory, number>>>(
    (acc, mythology) => {
      acc[mythology.category] = (acc[mythology.category] || 0) + 1;
      return acc;
    },
    {},
  );
}

function MythologyPage() {
  const [activeTab, setActiveTab] = useState<string>('mythology');
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingMythology, setEditingMythology] = useState<Mythology | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Mythology | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const {
    mythologies,
    setMythologies,
    selectedMythology,
    setSelectedMythology,
    activeCategory,
    setActiveCategory,
    loading,
    error,
    setLoading,
    setError,
  } = useMythologyStore();

  const { reload: loadMythologies, requestLoading } = useCollectionResource({
    cacheKey: 'mythologies',
    items: mythologies,
    loading,
    load: async () => {
      const result = await getMythologies();
      return result.data;
    },
    setItems: setMythologies,
    setLoading,
    setError,
    errorMessage: '获取神话数据失败:',
  });

  const visibleMythologies = useMemo(() => {
    return mythologies.filter((mythology) => {
      const categoryMatched = activeCategory ? mythology.category === activeCategory : true;
      return categoryMatched && matchesQuery(mythology, searchQuery);
    });
  }, [activeCategory, mythologies, searchQuery]);

  const categoryCounts = useMemo(() => buildCounts(mythologies), [mythologies]);

  const { run: saveMythology, loading: saving } = useRequest(
    async (input: MythologyInput) => {
      if (formMode === 'edit' && editingMythology) {
        const result = await updateMythology(editingMythology.id, input);
        return result.data;
      }

      const result = await createMythology(input);
      return result.data;
    },
    {
      manual: true,
      onBefore: () => setMutationError(null),
      onSuccess: (saved) => {
        setMythologies(
          formMode === 'edit'
            ? mythologies.map((item) => (item.id === saved.id ? saved : item))
            : [saved, ...mythologies],
        );
        setFormOpen(false);
        setEditingMythology(null);
      },
      onError: (err) => {
        setMutationError(err instanceof Error ? err.message : '保存失败');
      },
    },
  );

  const { run: removeMythology, loading: deleting } = useRequest(
    async (mythology: Mythology) => {
      const result = await deleteMythology(mythology.id);
      return result.data;
    },
    {
      manual: true,
      onBefore: () => setMutationError(null),
      onSuccess: (_deleted, [mythology]) => {
        setMythologies(mythologies.filter((item) => item.id !== mythology.id));
        if (selectedMythology?.id === mythology.id) {
          setSelectedMythology(null);
        }
        setPendingDelete(null);
      },
      onError: (err) => {
        setMutationError(err instanceof Error ? err.message : '删除失败');
      },
    },
  );

  const openCreateDialog = () => {
    setFormMode('create');
    setEditingMythology(null);
    setMutationError(null);
    setFormOpen(true);
  };

  const openEditDialog = useCallback((mythology: Mythology) => {
    setFormMode('edit');
    setEditingMythology(mythology);
    setMutationError(null);
    setFormOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((mythology: Mythology) => {
    setMutationError(null);
    setPendingDelete(mythology);
  }, []);

  const renderMythologyContent = () => (
    <Box className="mythology-stories-view">
      <Box className="mythology-action-bar">
        <TextField
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          size="small"
          placeholder="搜索标题、人物、出处"
          aria-label="搜索神话"
          className="mythology-search"
          slotProps={{
            input: {
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'var(--color-text-secondary)' }} />,
            },
          }}
        />
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          新增
        </Button>
      </Box>

      <CategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        counts={categoryCounts}
        totalCount={mythologies.length}
      />

      <Box className="mythology-summary">
        <Typography variant="body2">
          当前 {visibleMythologies.length} 条
        </Typography>
        <Typography variant="body2">
          {VALID_CATEGORIES.filter((category) => categoryCounts[category]).length} 个分类
        </Typography>
      </Box>

      <Box className="mythology-scroll-view">
        {loading || requestLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <StateView
            mode="error"
            title="加载失败"
            description={error.message || '请检查网络连接后重试'}
            actionLabel="重试"
            onAction={loadMythologies}
          />
        ) : (
          <MythologyGrid
            mythologies={visibleMythologies}
            onCardClick={setSelectedMythology}
            onEdit={openEditDialog}
            onDelete={handleDeleteRequest}
          />
        )}
      </Box>
    </Box>
  );

  const renderReligionContent = () => (
    <Box className="religion-graph-view">
      <ReligionGraph />
    </Box>
  );

  const tabs: FixedTabConfig[] = [
    {
      value: 'mythology',
      label: '神话故事',
      icon: <AutoStoriesIcon />,
      content: renderMythologyContent(),
    },
    {
      value: 'religion',
      label: '宗教关系',
      icon: <AccountTreeIcon />,
      content: renderReligionContent(),
    },
  ];

  return (
    <>
      <FixedTabsPage
        tabs={tabs}
        defaultTab="mythology"
        className={`mythology-page ${activeTab === 'religion' ? 'religion-view' : ''}`}
        onTabChange={setActiveTab}
      />

      <MythologyDetailModal
        mythology={selectedMythology}
        open={selectedMythology !== null}
        onClose={() => setSelectedMythology(null)}
      />

      <MythologyFormDialog
        open={formOpen}
        mode={formMode}
        mythology={editingMythology}
        saving={saving}
        error={mutationError}
        onClose={() => {
          setFormOpen(false);
          setEditingMythology(null);
        }}
        onSubmit={saveMythology}
      />

      <Dialog
        open={Boolean(pendingDelete)}
        onClose={deleting ? undefined : () => setPendingDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>删除神话</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            确认删除「{pendingDelete?.title}」？此操作会从当前数据源移除该记录。
          </Typography>
          {mutationError && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {mutationError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button disabled={deleting} onClick={() => setPendingDelete(null)}>
            取消
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleting || !pendingDelete}
            onClick={() => pendingDelete && removeMythology(pendingDelete)}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MythologyPage;
