/**
 * Type definitions for VocabApp
 * Zero-backend, client-first architecture
 */

// Database entities
export interface DictionaryEntry {
  id: string;
  english_word: string;
  chinese_translation: string;
  example_sentence: string | null;
  created_at: string;
}

export interface UserProgress {
  user_id: string;
  word_id: string;
  status: 'new' | 'known' | 'unknown';
  last_reviewed_at: string;
  created_at: string;
  updated_at: string;
}

// Extended types for application logic
export interface WordWithProgress extends DictionaryEntry {
  status: 'new' | 'known' | 'unknown';
  last_reviewed_at: string | null;
}

// Statistics types
export interface UserStatistics {
  total: number;        // Total unique words reviewed
  today: number;        // Words reviewed today
  thisWeek: number;     // Words reviewed this week
  remaining: number;    // Words still to learn (new + unknown)
}

export interface ProgressBreakdown {
  new: number;
  known: number;
  unknown: number;
}

export interface LearningStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
}

// Word fetching results
export interface WordFetchResult {
  success: boolean;
  data?: WordWithProgress;
  error?: {
    message: string;
    code?: string;
  };
}

// Progress update results
export interface ProgressUpdateResult {
  success: boolean;
  data?: {
    status: 'new' | 'known' | 'unknown';
    last_reviewed_at: string;
  };
  error?: {
    message: string;
    code?: string;
  };
}

// Component props
export interface FlashcardComponentProps {
  initialWord?: DictionaryEntry;
  onWordChange?: (word: DictionaryEntry | null) => void;
  onStatusUpdate?: (wordId: string, status: 'known' | 'unknown') => void;
  autoAdvance?: boolean;
  showControls?: boolean;
}

// Hook configurations
export interface KeyboardHandlerConfig {
  onSpace?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  enabled?: boolean;
  preventDefault?: boolean;
}

// Error types
export interface AppError {
  message: string;
  code?: string;
  context?: string;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Navigation types
export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
}