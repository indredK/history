import { Box, Fade } from "@mui/material";
import { TimelineFunctions, MapFunctions, PeopleFunctions, CultureFunctions, DynastiesFunctions } from "./";
import "./FunctionPanel.css";

interface FunctionPanelProps {
  activeTab: string;
}

export function FunctionPanel({ activeTab }: FunctionPanelProps) {
  const renderFunctionPanel = () => {
    switch (activeTab) {
      case "timeline":
        return <TimelineFunctions />;
      case "dynasties":
        return <DynastiesFunctions />;
      case "map":
        return <MapFunctions />;
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
        sx={{ minHeight: "fit-content", paddingTop: 2 }}
      >
        <Fade in={true} timeout={300} key={activeTab}>
          <Box>{renderFunctionPanel()}</Box>
        </Fade>
      </Box>
    </Box>
  );
}
