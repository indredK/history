import {
  Box,
  Popover,
  Stack,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
} from '@mui/material';
import { popoverConfig, formConfig, uiUtils } from '@/config';
import { EVENT_TYPE_LABELS } from '@/features/timeline/utils/timelineFilters';
import { useTimelineStore } from '@/store';
import type { Dynasty } from '@/services/culture/types';

interface EventTypeFilterPopoverProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
  mode?: 'eventType' | 'dynasty';
  dynasties?: Dynasty[];
}

export function EventTypeFilterPopover({
  anchorEl,
  onClose,
  mode = 'eventType',
  dynasties = [],
}: EventTypeFilterPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? `${mode}-filter-popover` : undefined;
  const {
    selectedEventTypes,
    selectedDynastyIds,
    setSelectedEventTypes,
    setSelectedDynastyIds,
    toggleSelectedEventType,
    toggleSelectedDynastyId,
  } = useTimelineStore();

  const isDynastyMode = mode === 'dynasty';
  const options = isDynastyMode
    ? dynasties.map((dynasty) => ({ value: dynasty.id, label: dynasty.name }))
    : EVENT_TYPE_LABELS.map((label) => ({ value: label, label }));
  const selectedValues = isDynastyMode ? selectedDynastyIds : selectedEventTypes;

  const handleSelectAll = () => {
    if (isDynastyMode) {
      setSelectedDynastyIds([]);
      return;
    }

    setSelectedEventTypes([]);
  };

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      {...uiUtils.getPopoverProps()}
    >
      <Box sx={{ ...popoverConfig.contentStyles, minWidth: 260 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle1">
            {isDynastyMode ? '朝代筛选' : '事件类型'}
          </Typography>
          <Button size="small" onClick={handleSelectAll}>
            全部
          </Button>
        </Stack>
        <Stack spacing={1}>
          {options.map((option) => {
            const checked = selectedValues.includes(option.value);

            return (
              <FormControlLabel
                key={option.value}
                control={(
                  <Checkbox
                    checked={checked}
                    size="small"
                    onChange={() => {
                      if (isDynastyMode) {
                        toggleSelectedDynastyId(option.value);
                      } else {
                        toggleSelectedEventType(option.value);
                      }
                    }}
                    sx={uiUtils.getThemedCheckboxStyles('timeline')}
                  />
                )}
                label={<Typography variant="body2">{option.label}</Typography>}
                sx={formConfig.controlLabel}
              />
            );
          })}
        </Stack>
      </Box>
    </Popover>
  );
}
