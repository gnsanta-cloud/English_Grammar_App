import type { GrammarLesson } from '../types';

/** 문법은 하루 1개 주제(레슨) */
export const LESSONS_PER_DAY = 1;

export function getTotalDays(lessonCount: number): number {
  if (lessonCount <= 0) return 0;
  return Math.ceil(lessonCount / LESSONS_PER_DAY);
}

export function getLessonsForDay(allLessons: GrammarLesson[], day: number): GrammarLesson[] {
  const start = (day - 1) * LESSONS_PER_DAY;
  return allLessons.slice(start, start + LESSONS_PER_DAY);
}

export function getDayLessonCount(allLessons: GrammarLesson[], day: number): number {
  return getLessonsForDay(allLessons, day).length;
}

export function indexToDayPlan(flatIndex: number): { day: number; indexInDay: number } {
  const day = Math.floor(flatIndex / LESSONS_PER_DAY) + 1;
  const indexInDay = flatIndex % LESSONS_PER_DAY;
  return { day, indexInDay };
}

export function dayPlanToFlatIndex(day: number, indexInDay: number): number {
  return (day - 1) * LESSONS_PER_DAY + indexInDay;
}

export type DayStatus = 'completed' | 'current' | 'available' | 'locked';

export function getDayStatus(
  day: number,
  completedDays: number[],
  currentDay: number,
): DayStatus {
  if (completedDays.includes(day)) return 'completed';
  if (day === currentDay) return 'current';
  const maxCompleted = completedDays.length > 0 ? Math.max(...completedDays) : 0;
  if (day <= maxCompleted + 1) return 'available';
  return 'locked';
}
