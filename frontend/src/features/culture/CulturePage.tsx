/**
 * 文化页面
 * Culture Page
 * 
 * 展示中国思想流派（诸子百家）
 * 使用公共的FixedTabsPage组件
 * 
 * Requirements: 2.1, 2.2, 2.3, 3.1, 4.1, 5.1, 5.2, 5.3
 */

import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';

import { useScholarStore, useSchoolStore } from '@/store';
import {
  createSchool as createSchoolApi,
  deleteSchool as deleteSchoolApi,
  getSchools,
  updateSchool as updateSchoolApi,
} from '@/services/school';
import {
  createScholar as createScholarApi,
  deleteScholar as deleteScholarApi,
  getScholars,
  updateScholar as updateScholarApi,
} from '@/services/person/scholars';
import type {
  PhilosophicalSchool,
  PhilosophicalSchoolMutationInput,
} from '@/services/school/types';
import type {
  Scholar,
  ScholarMutationInput,
} from '@/services/person/scholars/types';
import { useCollectionResource } from '@/hooks';
import { StateView } from '@/components/ui';

import { FixedTabsPage, type FixedTabConfig } from '@/components/common';
import {
  CultureEditDialog,
  ScholarDetailModal,
  ScholarFilter,
  ScholarGrid,
  SchoolDetail,
  SchoolsList,
} from './components';

import './CulturePage.scss';

type EditorState = {
  open: boolean;
  entity: 'school' | 'scholar';
  mode: 'create' | 'edit';
  school?: PhilosophicalSchool | null;
  scholar?: Scholar | null;
};

type DeleteTarget =
  | { entity: 'school'; item: PhilosophicalSchool }
  | { entity: 'scholar'; item: Scholar };

function toActionError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error) {
    return new Error(error.message || fallbackMessage);
  }

  if (typeof error === 'string' && error.trim()) {
    return new Error(error.trim());
  }

  return new Error(fallbackMessage);
}

function CulturePage() {
  const [editor, setEditor] = useState<EditorState>({
    open: false,
    entity: 'school',
    mode: 'create',
  });
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<Error | null>(null);

  // Schools store
  const {
    schools,
    selectedSchool,
    loading: schoolsLoading,
    error: schoolsError,
    setSchools,
    addSchool,
    updateSchool,
    removeSchool,
    setSelectedSchool,
    setLoading: setSchoolsLoading,
    setError: setSchoolsError,
  } = useSchoolStore();

  const {
    scholars,
    selectedScholar,
    loading: scholarLoading,
    error: scholarError,
    filters,
    setScholars,
    addScholar,
    updateScholar,
    removeScholar,
    setSelectedScholar,
    setLoading: setScholarLoading,
    setError: setScholarError,
    setDynastyFilter,
    setSchoolFilter,
    getFilteredScholars,
  } = useScholarStore();

  // 加载思想流派数据
  const { reload: loadSchools, requestLoading: schoolsRequestLoading } =
    useCollectionResource({
      cacheKey: 'schools',
      items: schools,
      loading: schoolsLoading,
      load: async () => {
        const result = await getSchools();
        return result.data;
      },
      setItems: setSchools,
      setLoading: setSchoolsLoading,
      setError: setSchoolsError,
      errorMessage: '获取思想流派数据失败:',
    });

  const { reload: loadScholars, requestLoading: scholarsRequestLoading } =
    useCollectionResource({
      cacheKey: 'culture-scholars',
      items: scholars,
      loading: scholarLoading,
      load: async () => {
        const result = await getScholars();
        return result.data;
      },
      setItems: setScholars,
      setLoading: setScholarLoading,
      setError: setScholarError,
      errorMessage: '获取文化名人数据失败:',
    });

  const filteredScholars = useMemo(() => {
    return getFilteredScholars();
  }, [getFilteredScholars, scholars, filters]);

  const dynastyOptions = useMemo(() => {
    const uniqueDynasties = [
      ...new Set(
        scholars
          .map((scholar) => scholar.dynasty || scholar.dynastyPeriod)
          .filter((dynasty): dynasty is string => Boolean(dynasty)),
      ),
    ];
    return ['全部', ...uniqueDynasties];
  }, [scholars]);

  const schoolOptions = useMemo(() => {
    const uniqueSchools = [
      ...new Set(
        [
          ...scholars.map((scholar) => scholar.schoolOfThought),
          ...schools.map((school) => school.name),
        ].filter((school): school is string => Boolean(school)),
      ),
    ];
    return ['全部', ...uniqueSchools];
  }, [scholars, schools]);

  const closeEditor = () => {
    if (!saving) {
      setEditor((state) => ({ ...state, open: false }));
      setActionError(null);
    }
  };

  const handleSaveSchool = async (
    input: PhilosophicalSchoolMutationInput,
    id?: string,
  ) => {
    setSaving(true);
    setActionError(null);
    try {
      const result = id
        ? await updateSchoolApi(id, input)
        : await createSchoolApi(input);
      if (id) {
        updateSchool(result.data);
      } else {
        addSchool(result.data);
      }
      setEditor((state) => ({ ...state, open: false }));
    } catch (error) {
      setActionError(toActionError(error, '保存思想流派失败'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveScholar = async (
    input: ScholarMutationInput,
    id?: string,
  ) => {
    setSaving(true);
    setActionError(null);
    try {
      const result = id
        ? await updateScholarApi(id, input)
        : await createScholarApi(input);
      if (id) {
        updateScholar(result.data);
      } else {
        addScholar(result.data);
      }
      setEditor((state) => ({ ...state, open: false }));
    } catch (error) {
      setActionError(toActionError(error, '保存文化名人失败'));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setSaving(true);
    setActionError(null);
    try {
      if (deleteTarget.entity === 'school') {
        await deleteSchoolApi(deleteTarget.item.id);
        removeSchool(deleteTarget.item.id);
      } else {
        await deleteScholarApi(deleteTarget.item.id);
        removeScholar(deleteTarget.item.id);
      }
      setDeleteTarget(null);
    } catch (error) {
      setActionError(toActionError(error, '删除失败'));
    } finally {
      setSaving(false);
    }
  };

  // 处理思想流派卡片点击
  const handleSchoolClick = (school: PhilosophicalSchool) => {
    setSelectedSchool(school);
  };

  // 关闭思想流派详情弹窗
  const handleCloseSchoolDetail = () => {
    setSelectedSchool(null);
  };

  const handleScholarClick = (scholar: Scholar) => {
    setSelectedScholar(scholar);
  };

  const handleCloseScholarDetail = () => {
    setSelectedScholar(null);
  };

  const openCreateSchoolEditor = () => {
    setActionError(null);
    setEditor({
      open: true,
      entity: 'school',
      mode: 'create',
      school: null,
    });
  };

  const openEditSchoolEditor = (school: PhilosophicalSchool) => {
    setActionError(null);
    setEditor({
      open: true,
      entity: 'school',
      mode: 'edit',
      school,
    });
  };

  const openCreateScholarEditor = () => {
    setActionError(null);
    setEditor({
      open: true,
      entity: 'scholar',
      mode: 'create',
      scholar: null,
    });
  };

  const openEditScholarEditor = (scholar: Scholar) => {
    setActionError(null);
    setEditor({
      open: true,
      entity: 'scholar',
      mode: 'edit',
      scholar,
    });
  };

  const requestDelete = (target: DeleteTarget) => {
    setActionError(null);
    setDeleteTarget(target);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
    setActionError(null);
  };

  const renderActionError = () => actionError && (
    <Alert severity="error" sx={{ mb: 2 }}>
      {actionError.message || '操作失败'}
    </Alert>
  );

  // 渲染思想流派内容
  const renderSchoolsContent = () => {
    // 错误状态 - Requirements 5.2
    if (schoolsError) {
      return (
        <StateView
          mode="error"
          title="加载失败"
          description={schoolsError.message || '请检查网络连接后重试'}
          actionLabel="重试"
          onAction={loadSchools}
        />
      );
    }

    return (
      <>
        {renderActionError()}
        <Box className="culture-action-bar">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateSchoolEditor}
          >
            新增流派
          </Button>
        </Box>

        {/* 思想流派列表 */}
        <SchoolsList
          schools={schools}
          onSchoolClick={handleSchoolClick}
          onSchoolEdit={openEditSchoolEditor}
          onSchoolDelete={(school) =>
            requestDelete({ entity: 'school', item: school })
          }
          loading={schoolsLoading || schoolsRequestLoading}
        />

        {/* 思想流派详情弹窗 */}
        <SchoolDetail
          school={selectedSchool}
          open={selectedSchool !== null}
          onClose={handleCloseSchoolDetail}
        />
      </>
    );
  };

  const renderScholarsContent = () => {
    if (scholarError) {
      return (
        <StateView
          mode="error"
          title="加载失败"
          description={scholarError.message || '请检查网络连接后重试'}
          actionLabel="重试"
          onAction={loadScholars}
        />
      );
    }

    return (
      <>
        {renderActionError()}
        <Box className="culture-action-bar">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateScholarEditor}
          >
            新增名人
          </Button>
        </Box>

        <ScholarFilter
          selectedDynasty={filters.dynasty}
          selectedSchool={filters.schoolOfThought}
          onDynastyChange={setDynastyFilter}
          onSchoolChange={setSchoolFilter}
          dynastyOptions={dynastyOptions}
          schoolOptions={schoolOptions}
          resultCount={filteredScholars.length}
        />

        <ScholarGrid
          scholars={filteredScholars}
          onScholarClick={handleScholarClick}
          onScholarEdit={openEditScholarEditor}
          onScholarDelete={(scholar) =>
            requestDelete({ entity: 'scholar', item: scholar })
          }
          loading={scholarLoading || scholarsRequestLoading}
        />

        <ScholarDetailModal
          scholar={selectedScholar}
          open={selectedScholar !== null}
          onClose={handleCloseScholarDetail}
        />
      </>
    );
  };

  // 定义标签页配置
  const tabs: FixedTabConfig[] = [
    {
      value: 'schools',
      label: '思想流派',
      icon: <MenuBookIcon />,
      content: renderSchoolsContent(),
    },
    {
      value: 'scholars',
      label: '文化名人',
      icon: <PersonIcon />,
      content: renderScholarsContent(),
    },
  ];

  return (
    <>
      <FixedTabsPage
        tabs={tabs}
        defaultTab="schools"
        className="culture-page"
      />

      <CultureEditDialog
        open={editor.open}
        entity={editor.entity}
        mode={editor.mode}
        school={editor.school ?? null}
        scholar={editor.scholar ?? null}
        schools={schools}
        saving={saving}
        error={actionError}
        onClose={closeEditor}
        onSaveSchool={handleSaveSchool}
        onSaveScholar={handleSaveScholar}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={saving ? undefined : closeDeleteDialog}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              background: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-lg)',
            },
          },
        }}
      >
        <DialogTitle sx={{ color: 'var(--color-text-primary)' }}>
          删除确认
        </DialogTitle>
        <DialogContent sx={{ color: 'var(--color-text-secondary)' }}>
          {deleteTarget
            ? `确认删除「${deleteTarget.item.name}」？`
            : ''}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={closeDeleteDialog}
            disabled={saving}
          >
            取消
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={saving}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CulturePage;
