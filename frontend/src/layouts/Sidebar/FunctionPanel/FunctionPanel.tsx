import { Box, Fade } from "@mui/material";
import { TimelineFunctions, MapFunctions, PeopleFunctions, CultureFunctions, DynastiesFunctions } from "./";
import "./FunctionPanel.scss";

interface FunctionPanelProps {
  activeTab: string;
  collapsed?: boolean;
}

export function FunctionPanel({ activeTab, collapsed = false }: FunctionPanelProps) {
  const renderFunctionPanel = () => {
    switch (activeTab) {
      case "timeline":
        return <TimelineFunctions />;
      case "dynasties":
        return <DynastiesFunctions />;
      case "map":
        return <MapFunctions collapsed={collapsed} />;
      case "people":
        return <PeopleFunctions />;
      case "culture":
        return <CultureFunctions />;
      default:
        return null;
    }
  };

  return (
    <Box
      className="function-panel-container"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        borderTop: "1px solid var(--color-border-medium)",
        overflow: "hidden",
      }}
    >
      {/* 功能面板内容区域 */}
      <Box 
        className="function-panel-content"
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingTop: 1.5,
          paddingBottom: 1,
          pr: 0.5,
        }}
      >
        <Fade in={true} timeout={300} key={activeTab}>
          <Box sx={{ pb: 1.5 }}>{renderFunctionPanel()}</Box>
        </Fade>
      </Box>
    </Box>
  );
}
