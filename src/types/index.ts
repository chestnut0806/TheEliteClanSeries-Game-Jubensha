// ═══════════════════════════════════════════════════════
// 月落华懋 · 类型定义（自驱版 + 诡叙 + 密室 + 问答终局）
// ═══════════════════════════════════════════════════════

export interface CharacterScript {
  id: string;
  name: string;
  title: string;
  age: number;
  avatar: string;
  publicRole: string;
  isCulprit: boolean;
  acts: CharacterAct[];
  hiddenActs?: CharacterAct[];
  hiddenClues?: PrivateClue[];
  voteHint: string;
  // 问答终局 — 每人5题，每题20分，总分100
  finalQuestions: PlayerQuestion[];
}

export interface CharacterAct {
  actId: string;
  actNumber: number;
  title: string;
  content: string;
  discussionPrompt?: string;
  investigationTrigger?: boolean;
  newClues: PrivateClue[];
  newObjectives: Objective[];
  requiresClue?: string;
  clueHint?: string;
}

export interface PrivateClue {
  id: string;
  name: string;
  description: string;
  canShare: boolean;
  actRevealed: number;
}

export interface Objective {
  id: string;
  type: 'hide' | 'discover' | 'protect' | 'frame';
  description: string;
  priority: 'high' | 'medium' | 'low';
  actRevealed: number;
}

// ═════════════════════════════════
// 问答终局系统
// ═════════════════════════════════

export interface PlayerQuestion {
  id: string;
  category: 'identity' | 'relationship' | 'method' | 'item' | 'motive';
  question: string;
  options: QuestionOption[];
  correctOptionId: string;
  points: number; // 每题20分
  explanation: string; // 答案解释
}

export interface QuestionOption {
  id: string;
  label: string;
  description: string;
}

export interface QuestionAnswer {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  pointsAwarded: number;
}

// ═════════════════════════════════
// 调查地图系统
// ═════════════════════════════════

export interface RoomNode {
  id: string;
  name: string;
  icon: string;
  x: number; // percentage position on map
  y: number;
  width: number;
  height: number;
  description: string;
  evidence: EvidenceMarker[];
  connections: string[]; // IDs of connected rooms
}

export interface EvidenceMarker {
  id: string;
  clueId: string;
  label: string;
  x: number; // relative to room
  y: number;
  found: boolean;
  isKey: boolean; // key evidence for locked-room analysis
}

export interface InvestigationLocation {
  id: string;
  name: string;
  icon: string;
  description: string;
  clues: DiscoverableClue[];
  roomNodeId?: string; // links to RoomNode on map
}

export interface DiscoverableClue {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  found: boolean;
  foundBy?: string;
  unlocksAct?: string;
  unlocksClue?: string;
  unlockMessage?: string;
}

export interface ClueItem {
  id: string;
  name: string;
  locationName: string;
  locationIcon: string;
  isPublic: boolean;
  takenByPrevious: boolean;
  found: boolean;
  foundBy?: string;
}

export interface VotingOption {
  characterId: string;
  name: string;
  title: string;
}

export type AppView = 'select' | 'character' | 'host';
