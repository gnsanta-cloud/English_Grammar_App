import type { GrammarLevel } from '../types';

export interface TopicInfo {
  id: GrammarLevel;
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
}

export const TOPICS: TopicInfo[] = [
  {
    id: 'middle',
    title: '중학 문법',
    subtitle: '중학교 핵심 영문법',
    icon: '📗',
    accent: '#4f46e5',
  },
  {
    id: 'high',
    title: '고등 문법',
    subtitle: '수능·내신 필수 문법',
    icon: '📘',
    accent: '#0891b2',
  },
  {
    id: 'basic',
    title: '기초 문법',
    subtitle: 'be동사·시제·전치사 기초',
    icon: '📙',
    accent: '#16a34a',
  },
  {
    id: 'practical',
    title: '실용 문법',
    subtitle: '회화·실전 표현 문법',
    icon: '💬',
    accent: '#ea580c',
  },
];

export function getTopicInfo(level: GrammarLevel): TopicInfo {
  return TOPICS.find((t) => t.id === level) ?? TOPICS[0];
}
