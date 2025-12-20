/**
 * 响应式组件演示页面
 * 展示所有响应式组件的使用方法
 */

import { Box, Divider } from '@mui/material';
import {
  ResponsiveContainer,
  ResponsiveText,
  ResponsiveButton,
  ResponsiveIconButton,
  ResponsiveCard,
  ResponsiveCardContent,
  ResponsiveCardActions,
  ResponsiveCardHeader,
  ResponsiveLayout,
  ResponsiveGrid,
  ResponsiveStack,
  ResponsiveTable,
  ResponsiveTableHead,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableCell,
  MobileTableContainer,
} from '@/components';
import { Settings, Favorite, Share } from '@mui/icons-material';
import { useResponsive } from '@/hooks/useResponsive';

export function ResponsiveDemo() {
  const { isMobile, isSmallMobile, screenWidth } = useResponsive();

  const demoData = [
    { id: 1, name: '项目A', status: '进行中', priority: '高', date: '2024-01-15' },
    { id: 2, name: '项目B', status: '已完成', priority: '中', date: '2024-01-10' },
    { id: 3, name: '项目C', status: '待开始', priority: '低', date: '2024-01-20' },
  ];

  return (
    <ResponsiveContainer maxWidth="1200px" centerContent>
      <Box sx={{ py: 2 }}>
        <ResponsiveText variant="h1" sx={{ mb: 3, textAlign: 'center' }}>
          响应式组件演示
        </ResponsiveText>
        
        <ResponsiveText variant="body1" sx={{ mb: 4, textAlign: 'center', opacity: 0.8 }}>
          当前屏幕宽度: {screenWidth}px | 设备类型: {isMobile ? (isSmallMobile ? '小屏手机' : '手机') : '桌面'}
        </ResponsiveText>

        {/* 文本组件演示 */}
        <ResponsiveCard sx={{ mb: 3 }}>
          <ResponsiveCardHeader title="响应式文本组件" />
          <ResponsiveCardContent>
            <ResponsiveStack spacing={2}>
              <ResponsiveText variant="h2">标题 H2</ResponsiveText>
              <ResponsiveText variant="h3">标题 H3</ResponsiveText>
              <ResponsiveText variant="h4">标题 H4</ResponsiveText>
              <ResponsiveText variant="body1">正文内容 - 这是一段示例文本，展示响应式字体大小的效果。</ResponsiveText>
              <ResponsiveText variant="body2">小号正文 - 在不同设备上会自动调整字体大小。</ResponsiveText>
              <ResponsiveText variant="caption">说明文字 - 最小的字体尺寸。</ResponsiveText>
            </ResponsiveStack>
          </ResponsiveCardContent>
        </ResponsiveCard>

        {/* 按钮组件演示 */}
        <ResponsiveCard sx={{ mb: 3 }}>
          <ResponsiveCardHeader title="响应式按钮组件" />
          <ResponsiveCardContent>
            <ResponsiveStack spacing={2}>
              <ResponsiveLayout direction="responsive" spacing={2}>
                <ResponsiveButton variant="contained" color="primary">
                  主要按钮
                </ResponsiveButton>
                <ResponsiveButton variant="outlined" color="secondary">
                  次要按钮
                </ResponsiveButton>
                <ResponsiveButton variant="text">
                  文本按钮
                </ResponsiveButton>
              </ResponsiveLayout>
              
              <ResponsiveLayout direction="responsive" spacing={2}>
                <ResponsiveIconButton color="primary">
                  <Settings />
                </ResponsiveIconButton>
                <ResponsiveIconButton color="secondary">
                  <Favorite />
                </ResponsiveIconButton>
                <ResponsiveIconButton>
                  <Share />
                </ResponsiveIconButton>
              </ResponsiveLayout>
            </ResponsiveStack>
          </ResponsiveCardContent>
        </ResponsiveCard>

        {/* 布局组件演示 */}
        <ResponsiveCard sx={{ mb: 3 }}>
          <ResponsiveCardHeader title="响应式布局组件" />
          <ResponsiveCardContent>
            <ResponsiveText variant="h6" sx={{ mb: 2 }}>网格布局</ResponsiveText>
            <ResponsiveGrid mobileColumns={1} tabletColumns={2} desktopColumns={3} spacing={2}>
              <ResponsiveCard>
                <ResponsiveCardContent>
                  <ResponsiveText variant="body1">网格项目 1</ResponsiveText>
                </ResponsiveCardContent>
              </ResponsiveCard>
              <ResponsiveCard>
                <ResponsiveCardContent>
                  <ResponsiveText variant="body1">网格项目 2</ResponsiveText>
                </ResponsiveCardContent>
              </ResponsiveCard>
              <ResponsiveCard>
                <ResponsiveCardContent>
                  <ResponsiveText variant="body1">网格项目 3</ResponsiveText>
                </ResponsiveCardContent>
              </ResponsiveCard>
            </ResponsiveGrid>

            <Divider sx={{ my: 3 }} />

            <ResponsiveText variant="h6" sx={{ mb: 2 }}>堆叠布局</ResponsiveText>
            <ResponsiveStack 
              mobileDirection="column" 
              tabletDirection="row" 
              desktopDirection="row"
              spacing={2}
            >
              <ResponsiveCard sx={{ flex: 1 }}>
                <ResponsiveCardContent>
                  <ResponsiveText variant="body1">堆叠项目 1</ResponsiveText>
                </ResponsiveCardContent>
              </ResponsiveCard>
              <ResponsiveCard sx={{ flex: 1 }}>
                <ResponsiveCardContent>
                  <ResponsiveText variant="body1">堆叠项目 2</ResponsiveText>
                </ResponsiveCardContent>
              </ResponsiveCard>
            </ResponsiveStack>
          </ResponsiveCardContent>
        </ResponsiveCard>

        {/* 表格组件演示 */}
        <ResponsiveCard sx={{ mb: 3 }}>
          <ResponsiveCardHeader title="响应式表格组件" />
          <ResponsiveCardContent disablePadding>
            <MobileTableContainer height="300px">
              <ResponsiveTable>
                <ResponsiveTableHead>
                  <ResponsiveTableRow>
                    <ResponsiveTableCell component="th" sticky priority="high">
                      项目名称
                    </ResponsiveTableCell>
                    <ResponsiveTableCell component="th" priority="medium">
                      状态
                    </ResponsiveTableCell>
                    <ResponsiveTableCell component="th" priority="low" hideOnMobile>
                      优先级
                    </ResponsiveTableCell>
                    <ResponsiveTableCell component="th" priority="medium">
                      日期
                    </ResponsiveTableCell>
                    <ResponsiveTableCell component="th" priority="low" hideOnSmallMobile>
                      操作
                    </ResponsiveTableCell>
                  </ResponsiveTableRow>
                </ResponsiveTableHead>
                <ResponsiveTableBody>
                  {demoData.map((item) => (
                    <ResponsiveTableRow key={item.id}>
                      <ResponsiveTableCell sticky priority="high">
                        <ResponsiveText variant="body2" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </ResponsiveText>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell priority="medium">
                        <ResponsiveText variant="body2">
                          {item.status}
                        </ResponsiveText>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell priority="low" hideOnMobile>
                        <ResponsiveText variant="body2">
                          {item.priority}
                        </ResponsiveText>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell priority="medium">
                        <ResponsiveText variant="body2">
                          {item.date}
                        </ResponsiveText>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell priority="low" hideOnSmallMobile>
                        <ResponsiveButton size="small" variant="outlined">
                          编辑
                        </ResponsiveButton>
                      </ResponsiveTableCell>
                    </ResponsiveTableRow>
                  ))}
                </ResponsiveTableBody>
              </ResponsiveTable>
            </MobileTableContainer>
          </ResponsiveCardContent>
        </ResponsiveCard>

        {/* 卡片组件演示 */}
        <ResponsiveCard sx={{ mb: 3 }}>
          <ResponsiveCardHeader 
            title="响应式卡片组件" 
            subheader="展示不同的卡片样式"
            action={
              <ResponsiveIconButton>
                <Settings />
              </ResponsiveIconButton>
            }
          />
          <ResponsiveCardContent>
            <ResponsiveText variant="body1">
              这是一个响应式卡片的内容区域。卡片的内边距、圆角和间距都会根据屏幕尺寸自动调整。
            </ResponsiveText>
          </ResponsiveCardContent>
          <ResponsiveCardActions spacing="normal">
            <ResponsiveButton variant="contained" size="small">
              确认
            </ResponsiveButton>
            <ResponsiveButton variant="outlined" size="small">
              取消
            </ResponsiveButton>
          </ResponsiveCardActions>
        </ResponsiveCard>

        {/* 使用说明 */}
        <ResponsiveCard>
          <ResponsiveCardHeader title="使用说明" />
          <ResponsiveCardContent>
            <ResponsiveText variant="body1" sx={{ mb: 2 }}>
              所有响应式组件都会根据当前屏幕尺寸自动调整样式：
            </ResponsiveText>
            <Box component="ul" sx={{ pl: 2 }}>
              <li>
                <ResponsiveText variant="body2">
                  <strong>小屏手机 (&lt; 375px)</strong>: 最紧凑的布局，隐藏低优先级内容
                </ResponsiveText>
              </li>
              <li>
                <ResponsiveText variant="body2">
                  <strong>标准手机 (375px - 768px)</strong>: 适中的间距和字体
                </ResponsiveText>
              </li>
              <li>
                <ResponsiveText variant="body2">
                  <strong>平板 (768px - 1024px)</strong>: 更大的触摸目标和间距
                </ResponsiveText>
              </li>
              <li>
                <ResponsiveText variant="body2">
                  <strong>桌面 (&gt; 1024px)</strong>: 完整的布局和所有功能
                </ResponsiveText>
              </li>
            </Box>
          </ResponsiveCardContent>
        </ResponsiveCard>
      </Box>
    </ResponsiveContainer>
  );
}