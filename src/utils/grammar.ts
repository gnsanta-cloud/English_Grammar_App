import type { GrammarLesson, GrammarLevel } from '../types';

interface RawLesson {
  title: string;
  rule: string;
  example: string;
  exampleKo: string;
}

const FILES: Record<GrammarLevel, string> = {
  middle: './data/middleGrammar.json',
  high: './data/highGrammar.json',
  basic: './data/basicGrammar.json',
  practical: './data/practicalGrammar.json',
};

let lessonBank: Record<GrammarLevel, GrammarLesson[]> | null = null;

function toLessons(data: RawLesson[], level: GrammarLevel): GrammarLesson[] {
  return data.map((item, index) => ({
    id: `${level}-${index}`,
    title: item.title,
    rule: item.rule,
    example: item.example,
    exampleKo: item.exampleKo,
    level,
  }));
}

export async function loadGrammarBank(): Promise<Record<GrammarLevel, GrammarLesson[]>> {
  if (lessonBank) return lessonBank;

  const levels = Object.keys(FILES) as GrammarLevel[];
  const entries = await Promise.all(
    levels.map(async (level) => {
      const res = await fetch(FILES[level]);
      if (!res.ok) throw new Error(`Failed to load ${FILES[level]}`);
      const data = (await res.json()) as RawLesson[];
      return [level, toLessons(data, level)] as const;
    }),
  );

  lessonBank = Object.fromEntries(entries) as Record<GrammarLevel, GrammarLesson[]>;
  return lessonBank;
}

export function getLessonsByLevel(level: GrammarLevel): GrammarLesson[] {
  return lessonBank?.[level] ?? [];
}

export function getAllBankLessons(): GrammarLesson[] {
  if (!lessonBank) return [];
  return Object.values(lessonBank).flat();
}

export function getLevelLabel(level: GrammarLevel): string {
  const labels: Record<GrammarLevel, string> = {
    middle: '중학 문법',
    high: '고등 문법',
    basic: '기초 문법',
    practical: '실용 문법',
  };
  return labels[level];
}
