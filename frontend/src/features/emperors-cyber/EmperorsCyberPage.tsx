import { useEffect, useMemo, useState } from 'react';

import { getDynastyColor } from './data';
import { StateView } from '@/components/ui';
import { DynastySelector, EmperorDetail, EmperorSelector } from './components';
import { useEmperorsCyberData } from './hooks/useEmperorsCyberData';
import './EmperorsCyberPage.scss';

function EmperorsCyberPage() {
  const { dynasties, emperors, loading, error, reload } = useEmperorsCyberData();
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
        ) : error ? (
          <main className="cyber-loading-shell">
            <StateView
              mode="error"
              title="帝王档案加载失败"
              description={error.message || '请稍后重试'}
              actionLabel="重试"
              onAction={reload}
              minHeight="100%"
            />
          </main>
        ) : dynasties.length === 0 ? (
          <main className="cyber-loading-shell">
            <StateView
              mode="empty"
              title="暂无帝王档案"
              description="未从年表数据中读取到可展示的朝代和帝王。"
              minHeight="100%"
            />
          </main>
        ) : (
          <main className="cyber-stage">
            <div className="cyber-mobile-controls" aria-label="帝王档案移动端选择">
              <label className="cyber-mobile-field">
                <span>朝代</span>
                <select
                  value={activeDynastyId}
                  onChange={(event) => setActiveDynastyId(event.target.value)}
                >
                  {dynasties.map((dynasty) => (
                    <option key={dynasty.id} value={dynasty.id}>
                      {dynasty.name} {dynasty.era}
                    </option>
                  ))}
                </select>
              </label>
              <label className="cyber-mobile-field">
                <span>帝王</span>
                <select
                  value={selectedEmperor?.id || ''}
                  onChange={(event) => setActiveEmperorId(event.target.value)}
                  disabled={filteredEmperors.length === 0}
                >
                  {filteredEmperors.length === 0 ? (
                    <option value="">该朝代暂无帝王数据</option>
                  ) : (
                    filteredEmperors.map((emperor) => (
                      <option key={emperor.id} value={emperor.id}>
                        {emperor.name || emperor.title} {emperor.period}
                      </option>
                    ))
                  )}
                </select>
              </label>
            </div>

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
