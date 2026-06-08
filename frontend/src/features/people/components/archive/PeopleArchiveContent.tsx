import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCollectionResource } from '@/hooks';
import { usePersonStore } from '@/store';
import {
  createPerson,
  deletePerson,
  getPersons,
  updatePerson,
  type CommonPerson,
  type CreateCommonPersonInput,
} from '@/services/person/common';
import { StateView } from '@/components/ui';
import { PeopleFilter } from '../common';
import { PersonArchiveGrid } from './PersonArchiveGrid';
import { PersonDetailModal } from './PersonDetailModal';
import { PersonFormDialog } from './PersonFormDialog';
import { getRoleLabel } from './personArchiveUtils';
import type { PersonSortBy } from '@/store/personStore';

type FormMode = 'create' | 'edit';

const SORT_OPTIONS = [
  { value: 'birthYear', label: '按生年' },
  { value: 'deathYear', label: '按卒年' },
  { value: 'dynasty', label: '按朝代' },
  { value: 'name', label: '按姓名' },
];

const GENDER_OPTIONS = [
  { value: '全部', label: '全部' },
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
];

export function PeopleArchiveContent() {
  const store = usePersonStore();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CommonPerson | null>(null);

  const { reload, requestLoading } = useCollectionResource({
    cacheKey: 'people-archive',
    items: store.persons,
    loading: store.loading,
    load: async () => {
      const result = await getPersons();
      return result.data;
    },
    setItems: store.setPersons,
    setLoading: store.setLoading,
    setError: store.setError,
    errorMessage: '获取人物档案失败:',
  });

  const filteredPersons = useMemo(
    () => store.getFilteredPersons(),
    [store, store.persons, store.filters],
  );

  const filters = useMemo(
    () => [
      {
        name: 'dynasty',
        label: '朝代',
        value: store.filters.dynasty,
        options: store.getDynastyOptions().map((dynasty) => ({
          value: dynasty,
          label: dynasty,
        })),
        onChange: store.setDynastyFilter,
      },
      {
        name: 'role',
        label: '身份',
        value: store.filters.role,
        options: store.getRoleOptions().map((role) => ({
          value: role,
          label: role === '全部' ? role : getRoleLabel(role),
        })),
        onChange: store.setRoleFilter,
      },
      {
        name: 'gender',
        label: '性别',
        value: store.filters.gender,
        options: GENDER_OPTIONS,
        onChange: store.setGenderFilter,
      },
    ],
    [store],
  );

  const handleCreate = () => {
    store.setError(null);
    store.setEditingPerson(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleEdit = (person: CommonPerson) => {
    store.setError(null);
    store.setEditingPerson(person);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleSave = async (input: CreateCommonPersonInput, id?: string) => {
    setSaving(true);
    try {
      if (formMode === 'edit' && id) {
        const result = await updatePerson(id, input);
        store.updatePerson(result.data);
      } else {
        const result = await createPerson(input);
        store.addPerson(result.data);
      }
      store.setError(null);
      setFormOpen(false);
      store.setEditingPerson(null);
    } catch (error) {
      store.setError(error instanceof Error ? error : new Error('保存人物档案失败'));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deletePerson(deleteTarget.id);
      store.removePerson(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      store.setError(error instanceof Error ? error : new Error('删除人物档案失败'));
    } finally {
      setSaving(false);
    }
  };

  if (store.error && store.persons.length === 0) {
    return (
      <StateView
        mode="error"
        title="加载失败"
        description={store.error.message || '请检查网络连接后重试'}
        actionLabel="重试"
        onAction={reload}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Box
        className="people-archive-toolbar"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto' },
          gap: 1.25,
          alignItems: { xs: 'stretch', md: 'start' },
          mb: 1,
        }}
      >
        <PeopleFilter
          searchQuery={store.filters.searchQuery}
          onSearchChange={store.setSearchQuery}
          searchPlaceholder="搜索姓名、字号、籍贯、成就..."
          filters={filters}
          sortBy={store.filters.sortBy}
          sortOptions={SORT_OPTIONS}
          onSortChange={(value) => store.setSortBy(value as PersonSortBy)}
          resultCount={filteredPersons.length}
          resultLabel="位人物"
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={{ alignSelf: { xs: 'stretch', md: 'flex-start' }, whiteSpace: 'nowrap' }}
        >
          新增
        </Button>
      </Box>

      {store.error && (
        <Typography
          variant="body2"
          sx={{ color: 'var(--color-error)', mb: 1, px: 0.5 }}
        >
          {store.error.message}
        </Typography>
      )}

      <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
        <PersonArchiveGrid
          persons={filteredPersons}
          loading={requestLoading}
          onPersonClick={store.setSelectedPerson}
          onPersonEdit={handleEdit}
          onPersonDelete={setDeleteTarget}
        />
      </Box>

      <PersonDetailModal
        person={store.selectedPerson}
        open={store.selectedPerson !== null}
        onClose={() => store.setSelectedPerson(null)}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
      />

      <PersonFormDialog
        open={formOpen}
        mode={formMode}
        person={store.editingPerson}
        saving={saving}
        error={store.error}
        onClose={() => {
          setFormOpen(false);
          store.setEditingPerson(null);
          store.setError(null);
        }}
        onSave={handleSave}
      />

      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        aria-labelledby="person-delete-title"
      >
        <DialogTitle id="person-delete-title">删除人物档案</DialogTitle>
        <DialogContent>
          <Typography>
            确认删除「{deleteTarget?.name}」？
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={saving}>
            取消
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            disabled={saving}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PeopleArchiveContent;
