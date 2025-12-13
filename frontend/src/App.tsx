import { useEffect, useState } from 'react';
import { Timeline } from './components/Timeline';
import { MapView } from './components/MapView';
import { EventList } from './components/EventList';
import './App.css';

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);

  // 滚动进度指示器逻辑
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercentage = (totalScroll / windowHeight) * 100;
      setScrollProgress(scrollPercentage);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 滚动时元素渐显效果
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll('.scroll-fade');
    elementsToAnimate.forEach(element => observer.observe(element));

    return () => {
      elementsToAnimate.forEach(element => observer.unobserve(element));
    };
  }, []);

  return (
    <div className="app">
      {/* 滚动进度指示器 */}
      <div 
        className="scroll-progress" 
        style={{ width: `${scrollProgress}%` }}
      />

      <header className="app-header">
        <div className="app-header-content">
          <h1>中国历史全景</h1>
          <p>Chinese Historical Panorama</p>
        </div>
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
        <p>&copy; 2025 中国历史全景 | Chinese Historical Panorama | MIT License</p>
      </footer>
    </div>
  );
}

export default App;
