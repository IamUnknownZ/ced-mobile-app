/** Shared data contracts for the game and education UI. */
export type WasteCategoryId = 'general' | 'recyclable' | 'organic' | 'hazardous';
export type StageId = 'park' | 'school' | 'beach' | 'community';

export interface WasteItem {
  id: string;
  nameTh: string;
  categoryId: WasteCategoryId;
  explanationTh: string;
  disposalTipTh: string;
  modelKey: string;
  difficulty?: 1 | 2 | 3;
}
export interface WasteCategory {
  id: WasteCategoryId;
  nameTh: string;
  color: string;
  icon: string;
}
export interface StageConfig {
  id: StageId;
  titleTh: string;
  educationalGoalTh: string;
  wasteItemIds: string[];
  targetCount: number;
}
export interface GameSettings {
  sensitivity: number;
  invertX: boolean;
  invertY: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}
export interface GuideScreenProps {
  items: readonly WasteItem[];
  categories: readonly WasteCategory[];
  discoveredIds: readonly string[];
  onBack: () => void;
}
export interface TutorialScreenProps { onBack: () => void; onStart: () => void }
export interface SettingsScreenProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onBack: () => void;
}
