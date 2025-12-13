import { Timeline } from './components/Timeline';
import { MapView } from './components/MapView';
import { EventList } from './components/EventList';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>中国历史全景</h1>
        <p>Chinese Historical Panorama</p>
      </header>

      <main className="app-main">
        <div className="layout">
          <aside className="sidebar">
            <Timeline />
          </aside>

          <section className="content">
            <MapView />
            <EventList />
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 Chinese Historical Panorama | MIT License</p>
      </footer>
    </div>
  );
}

export default App;
