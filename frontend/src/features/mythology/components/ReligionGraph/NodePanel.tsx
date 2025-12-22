/**
 * 节点详情面板组件
 * Node Detail Panel Component
 * 
 * Requirements: 5.3
 */

import { 
  Box, 
  Typography, 
  IconButton, 
  Chip,
  Divider,
  Slide,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import PlaceIcon from '@mui/icons-material/Place';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import type { ReligionNode, ReligionEdge } from '@/services/religion/types';
import { NODE_COLORS, SECT_COLORS, RELATIONSHIP_COLORS } from '@/services/religion/types';

interface NodePanelProps {
  node: ReligionNode | null;
  onClose: () => void;
  relatedNodes: ReligionNode[];
  relatedEdges: ReligionEdge[];
}

/**
 * 获取节点类型图标
 */
function getNodeTypeIcon(type: ReligionNode['type']) {
  switch (type) {
    case 'deity':
      return <PersonIcon />;
    case 'sect':
      return <GroupsIcon />;
    case 'realm':
      return <PlaceIcon />;
    case 'artifact':
      return <AutoAwesomeIcon />;
    default:
      return <PersonIcon />;
  }
}

/**
 * 获取节点类型名称
 */
function getNodeTypeName(type: ReligionNode['type']) {
  switch (type) {
    case 'deity':
      return '神仙';
    case 'sect':
      return '门派';
    case 'realm':
      return '境界';
    case 'artifact':
      return '法宝';
    default:
      return '未知';
  }
}

/**
 * 节点详情面板组件
 * 显示节点详细信息和相关关系
 */
export function NodePanel({ node, onClose, relatedNodes, relatedEdges }: NodePanelProps) {
  if (!node) return null;

  const nodeColor = node.sect ? SECT_COLORS[node.sect] : NODE_COLORS[node.type]?.fill || '#999';

  return (
    <Slide direction="left" in={!!node} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: { xs: '100%', sm: 320 },
          height: '100%',
          backgroundColor: 'var(--glass-bg-dark, rgba(30, 30, 30, 0.95))',
          backdropFilter: 'blur(var(--glass-blur-medium, 20px))',
          borderLeft: '1px solid var(--glass-border-color, rgba(255, 255, 255, 0.18))',
          overflow: 'auto',
          zIndex: 10,
        }}
      >
        {/* 头部 */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--glass-border-color, rgba(255, 255, 255, 0.1))',
            background: `linear-gradient(135deg, ${nodeColor}22 0%, transparent 100%)`,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: nodeColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                {getNodeTypeIcon(node.type)}
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                  {node.name}
                </Typography>
                {node.title && (
                  <Typography variant="caption" sx={{ color: nodeColor }}>
                    {node.title}
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label={getNodeTypeName(node.type)}
                size="small"
                sx={{
                  backgroundColor: `${NODE_COLORS[node.type]?.fill}33`,
                  color: NODE_COLORS[node.type]?.fill,
                  fontSize: '0.7rem',
                }}
              />
              {node.sect && (
                <Chip
                  label={node.sect}
                  size="small"
                  sx={{
                    backgroundColor: `${SECT_COLORS[node.sect]}33`,
                    color: SECT_COLORS[node.sect],
                    fontSize: '0.7rem',
                  }}
                />
              )}
            </Box>
          </Box>
          
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'var(--color-text-secondary)',
              '&:hover': {
                color: 'var(--color-text-primary)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* 描述 */}
        <Box sx={{ p: 2 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'var(--color-text-secondary)',
              lineHeight: 1.8,
            }}
          >
            {node.description}
          </Typography>

          {/* 属性 */}
          {node.attributes && (
            <Box sx={{ mt: 2 }}>
              {node.attributes.power && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                    法力/能力
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                    {node.attributes.power}
                  </Typography>
                </Box>
              )}
              {node.attributes.weapon && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                    法宝
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                    {node.attributes.weapon}
                  </Typography>
                </Box>
              )}
              {node.attributes.mount && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                    坐骑
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                    {node.attributes.mount}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* 出处 */}
          {node.source && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                出处
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                {node.source}
              </Typography>
            </Box>
          )}
        </Box>

        {/* 相关关系 */}
        {relatedEdges.length > 0 && (
          <>
            <Divider sx={{ borderColor: 'var(--glass-border-color, rgba(255, 255, 255, 0.1))' }} />
            <Box sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'var(--color-text-primary)',
                  mb: 1.5,
                  fontWeight: 600,
                }}
              >
                相关关系 ({relatedEdges.length})
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {relatedEdges.map(edge => {
                  const relatedNode = relatedNodes.find(
                    n => n.id === (edge.source === node.id ? edge.target : edge.source)
                  );
                  if (!relatedNode) return null;

                  const isSource = edge.source === node.id;
                  
                  return (
                    <Box
                      key={edge.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        borderRadius: 'var(--glass-radius-sm, 8px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        transition: 'background-color 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: RELATIONSHIP_COLORS[edge.relationship],
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: RELATIONSHIP_COLORS[edge.relationship],
                          fontWeight: 500,
                          minWidth: 40,
                        }}
                      >
                        {edge.relationship}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'var(--color-text-secondary)' }}
                      >
                        {isSource ? '→' : '←'}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'var(--color-text-primary)', flex: 1 }}
                      >
                        {relatedNode.name}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Slide>
  );
}

export default NodePanel;
