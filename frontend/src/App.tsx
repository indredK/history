import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import './styles/app.css';
import './styles/ui.css';

function App() {
  return (
    <Routes>
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  );
}

export default App;
