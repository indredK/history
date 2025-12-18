import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import './styles/app.css';
import './styles/ui.css';

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
