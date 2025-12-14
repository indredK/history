import { useState } from 'react';
import { Box } from '@mui/material';
import { Sidebar } from './layouts/Sidebar';
import { MainContent } from './layouts/MainContent';
import { Footer } from './layouts/Footer';
import './styles/app.css';
import './styles/ui.css';

function App() {
  const [activeTab, setActiveTab] = useState<string>('timeline');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="app">
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <MainContent activeTab={activeTab as 'timeline' | 'map'} />
      </Box>
      <Footer />
    </Box>
  );
}

export default App;
