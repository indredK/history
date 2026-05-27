import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { AppRouter } from './router/Router';
import './styles/app.css';
import './styles/ui.css';

function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}

export default App;
