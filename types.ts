

export enum UserRole {
  STUDENT = 'student',
  PARENT = 'parent',
  TEACHER = 'teacher',
  ADULT = 'adult',
}

export enum ContentType {
  ARTICLE = 'article',
  TOOL = 'tool',
  EXTERNAL_LINK = 'external_link',
  DOWNLOADABLE = 'downloadable'
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  roles: UserRole[];
  tags: string[];
  url?: string; // For external links
  content?: string; // For internal articles
  readingLevel?: number; // Calculated grade level
  imageUrl?: string; // Visual cover for the resource
}

export interface DictionaryResult {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  synonyms?: string[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
  }[];
}

export interface HomeworkResponse {
  subject: string;
  original_text: string;
  simplified_version: string; // The LD friendly version
  key_concepts: string[];
  steps?: {
    title: string;
    explanation: string;
  }[]; // For math/science problems
  practice_problem?: {
    question: string;
    hint: string;
  };
}

export interface AccessibilityState {
  isDyslexicFont: boolean;
  isHighContrast: boolean;
  isFocusMode: boolean; // Increased line height, limited width
  textSize: 'normal' | 'large' | 'xl';
}

// --- Math Playground Types ---

export type MathActionType = 'rect' | 'circle' | 'line' | 'text' | 'clear';

export interface MathCanvasAction {
  type: MathActionType;
  x?: number;
  y?: number;
  w?: number; // width
  h?: number; // height
  r?: number; // radius
  x1?: number; // line start
  y1?: number;
  x2?: number; // line end
  y2?: number;
  text?: string;
  color?: string;
  size?: number; // font size or line width
  label?: string; // accessible label or visual label near shape
}

export interface MathPlaygroundResponse {
  explanation: string;
  actions: MathCanvasAction[];
}
