export type GrammarLevel = 'middle' | 'high' | 'basic' | 'practical';

export interface GrammarLesson {
  id: string;
  title: string;
  rule: string;
  example: string;
  exampleKo: string;
  level: GrammarLevel;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  textKo?: string;
}

export type TabId = 'home' | 'learn' | 'quiz' | 'conversation' | 'mygrammar' | 'settings';
