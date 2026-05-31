import { useState, useCallback } from 'react';
import type { AppView } from './types';
import { CharacterSelect } from './components/CharacterSelect';
import { CharacterView } from './components/CharacterView';
import { HostView } from './components/HostView';
import { CASE_TITLE } from './data/character-scripts';

export default function App() {
  const [view, setView] = useState<AppView>('select');
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [lockPin, setLockPin] = useState<string | null>(null);

  const handleSelectCharacter = useCallback((charId: string) => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setLockPin(pin);
    setSelectedChar(charId);
    setView('character');
  }, []);

  const handleBack = useCallback(() => {
    setSelectedChar(null);
    setLockPin(null);
    setView('select');
  }, []);

  const isSelectView = view === 'select';

  return (
    <div className="min-h-screen bg-cream">
      <div className="h-1 bg-gradient-to-r from-burgundy via-brass to-burgundy" />

      {!isSelectView && (
        <nav className="sticky top-0 z-30 bg-cream/95 backdrop-blur-sm border-b border-sepia-light/15">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-sm font-ui text-sepia-light hover:text-burgundy transition-colors"
            >
              ← 返回角色选择
            </button>
            <span className="text-xs font-ui text-sepia-light/60">{CASE_TITLE}</span>
          </div>
        </nav>
      )}

      <main className="max-w-5xl mx-auto px-4 pb-16 pt-4">
        {view === 'select' && (
          <CharacterSelect
            onSelectCharacter={handleSelectCharacter}
            onEnterHost={() => setView('host')}
          />
        )}
        {view === 'character' && selectedChar && (
          <CharacterView
            characterId={selectedChar}
            lockPin={lockPin!}
          />
        )}
        {view === 'host' && <HostView onBack={handleBack} />}
      </main>
    </div>
  );
}
