import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { AppRouter } from './router/Router';
import './styles/app.scss';
import './styles/ui.scss';

function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}

export default App;
