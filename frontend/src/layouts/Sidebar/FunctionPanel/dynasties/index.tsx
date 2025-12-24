import {
  Stack,
  Button,
  Typography,
  Box
} from '@mui/material';
import {
  UnfoldMore,
  UnfoldLess,
} from '@mui/icons-material';
import { buttonConfig } from '@/config';
import { useDynastiesExpanded } from '@/store/dynastyExpandedStore';

export function DynastiesFunctions() {
  const {
    expandAllDynasties,
    collapseAllDynasties,
    getExpandedDynastiesCount,
    getTotalDynastiesCount,
  } = useDynastiesExpanded();

  const expandedCount = getExpandedDynastiesCount();
  const totalCount = getTotalDynastiesCount();

  const handleExpandAll = () => {
    expandAllDynasties();
  };

  const handleCollapseAll = () => {
    collapseAllDynasties();
  };

  return (
    <Stack spacing={1}>
      {/* 状态显示 */}
      <Box sx={{ 
        px: 1, 
        py: 0.5, 
        backgroundColor: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-light)'
      }}>
        <Typography variant="caption" sx={{ 
          color: 'var(--color-text-secondary)',
          display: 'block',
          textAlign: 'center'
        }}>
          已展开 {expandedCount} / {totalCount} 个朝代
        </Typography>
      </Box>

      {/* 展开全部朝代 */}
      <Button
        startIcon={<UnfoldMore />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleExpandAll}
        disabled={expandedCount === totalCount}
        sx={{
          ...buttonConfig.functionButton,
          '&.Mui-disabled': {
            opacity: 0.5,
            backgroundColor: 'var(--color-bg-tertiary)',
          }
        }}
      >
        展开全部朝代
      </Button>
      
      {/* 收起全部朝代 */}
      <Button
        startIcon={<UnfoldLess />}
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleCollapseAll}
        disabled={expandedCount === 0}
        sx={{
          ...buttonConfig.functionButton,
          '&.Mui-disabled': {
            opacity: 0.5,
            backgroundColor: 'var(--color-bg-tertiary)',
          }
        }}
      >
        收起全部朝代
      </Button>
    </Stack>
  );
}