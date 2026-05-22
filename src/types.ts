export type GrammarLevel = 'middle' | 'high' | 'basic' | 'practical';

export interface GrammarQuizItem {
  /** 빈칸은 ___ 로 표시 (예: She ___ a student.) */
  sentence: string;
  answer: string;
  choices: string[];
}

export interface GrammarExample {
  en: string;
  ko: string;
}

export interface GrammarLesson {
  id: string;
  title: string;
  rule: string;
  tip?: string;
  example: string;
  exampleKo: string;
  examples?: GrammarExample[];
  quizzes: GrammarQuizItem[];
  level: GrammarLevel;
}

export interface GrammarQuizQuestion {
  id: string;
  lessonId: string;
  lessonTitle: string;
  before: string;
  after: string;
  answer: string;
  choices: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  textKo?: string;
}

export type TabId = 'home' | 'learn' | 'quiz' | 'conversation' | 'mygrammar' | 'settings';
