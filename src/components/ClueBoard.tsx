import type { DiscoverableClue } from '../types';

interface Props {
  clues: DiscoverableClue[];
}

export function ClueBoard({ clues }: Props) {
  if (clues.length === 0) return null;

  return (
    <div className="paper-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">🕵️</span>
        <span className="text-sm font-title font-bold text-ink">公共线索板</span>
        <span className="text-[10px] text-sepia-light/50 font-ui ml-auto">
          {clues.length} 条公开线索
        </span>
      </div>
      <div className="space-y-2">
        {clues.map(clue => (
          <div key={clue.id} className="script-block border-brass/20">
            <div className="flex items-center gap-2 mb-1">
              <span className="tag-clue text-[9px]">{clue.name}</span>
            </div>
            <p className="text-xs text-sepia leading-relaxed">{clue.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
