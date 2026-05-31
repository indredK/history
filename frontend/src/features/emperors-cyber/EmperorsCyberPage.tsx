import { useEffect, useMemo, useState } from 'react';

import { getDynastyColor } from './data';
import { DynastySelector, EmperorDetail, EmperorSelector } from './components';
import { useEmperorsCyberData } from './hooks/useEmperorsCyberData';
import './EmperorsCyberPage.scss';

function EmperorsCyberPage() {
  const { dynasties, emperors, loading } = useEmperorsCyberData();
  const [activeDynastyId, setActiveDynastyId] = useState('');
  const [activeEmperorId, setActiveEmperorId] = useState('');

  const emperorCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    emperors.forEach((emperor) => {
      counts[emperor.dynastyId] = (counts[emperor.dynastyId] || 0) + 1;
    });

    return counts;
  }, [emperors]);

  const defaultDynastyId = useMemo(
    () => dynasties.find((dynasty) => (emperorCounts[dynasty.id] || 0) > 0)?.id || dynasties[0]?.id || '',
    [dynasties, emperorCounts],
  );

  useEffect(() => {
    if (!activeDynastyId && defaultDynastyId) {
      setActiveDynastyId(defaultDynastyId);
    }
  }, [activeDynastyId, defaultDynastyId]);

  const filteredEmperors = useMemo(
    () => emperors.filter((emperor) => emperor.dynastyId === activeDynastyId),
    [activeDynastyId, emperors],
  );

  const activeColor = getDynastyColor(activeDynastyId, dynasties);
  const selectedEmperor = useMemo(
    () => filteredEmperors.find((emperor) => emperor.id === activeEmperorId) || filteredEmperors[0] || null,
    [activeEmperorId, filteredEmperors],
  );
  const selectedEmperorIndex = useMemo(
    () => filteredEmperors.findIndex((emperor) => emperor.id === selectedEmperor?.id),
    [filteredEmperors, selectedEmperor],
  );

  useEffect(() => {
    if (filteredEmperors.length === 0) {
      if (activeEmperorId) {
        setActiveEmperorId('');
      }
      return;
    }

    if (!filteredEmperors.some((emperor) => emperor.id === activeEmperorId)) {
      setActiveEmperorId(filteredEmperors[0]!.id);
    }
  }, [activeEmperorId, filteredEmperors]);

  return (
    <div className="cyber-emperors-page">
      <div className="cyber-shell">
        {loading ? (
          <main className="cyber-loading-shell">
            <div className="cyber-loading">
              <div className="cyber-loading-spinner" style={{ borderColor: activeColor }} />
              <span>正在调取帝王档案</span>
            </div>
          </main>
        ) : (
          <main className="cyber-stage">
            <DynastySelector
              dynasties={dynasties}
              activeDynasty={activeDynastyId}
              onSelect={setActiveDynastyId}
              emperorCounts={emperorCounts}
            />

            <EmperorDetail
              emperor={selectedEmperor}
              color={selectedEmperor ? getDynastyColor(selectedEmperor.dynastyId, dynasties) : activeColor}
              emperorIndex={Math.max(selectedEmperorIndex, 0)}
              emperorCount={filteredEmperors.length}
            />

            <EmperorSelector
              emperors={filteredEmperors}
              activeEmperorId={selectedEmperor?.id || ''}
              onSelect={setActiveEmperorId}
              accentColor={activeColor}
            />
          </main>
        )}
      </div>
    </div>
  );
}

export default EmperorsCyberPage;
