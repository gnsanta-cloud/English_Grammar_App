import { Preferences } from '@capacitor/preferences';
import type { GrammarLevel } from '../types';
import { LESSONS_PER_DAY } from './dailyPlan';

export interface NotificationSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

const KEYS = {
  level: 'grammar_level',
  index: 'grammar_index',
  currentDay: 'grammar_current_day',
  dayIndex: 'grammar_day_index',
  completedDays: 'grammar_completed_days',
  dayStudied: 'grammar_day_studied',
  myGrammar: 'my_grammar_bookmarks',
  notifyEnabled: 'grammar_notify_enabled',
  notifyHour: 'grammar_notify_hour',
  notifyMinute: 'grammar_notify_minute',
} as const;

export async function loadLevel(): Promise<GrammarLevel> {
  const { value } = await Preferences.get({ key: KEYS.level });
  if (value === 'middle' || value === 'high' || value === 'basic' || value === 'practical') {
    return value;
  }
  return 'middle';
}

export async function saveLevel(level: GrammarLevel): Promise<void> {
  await Preferences.set({ key: KEYS.level, value: level });
}

export async function loadIndex(): Promise<number> {
  const { value } = await Preferences.get({ key: KEYS.index });
  const n = parseInt(value ?? '0', 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function completedDaysKey(level: GrammarLevel) {
  return `${KEYS.completedDays}_${level}`;
}

function currentDayKey(level: GrammarLevel) {
  return `${KEYS.currentDay}_${level}`;
}

function dayIndexKey(level: GrammarLevel) {
  return `${KEYS.dayIndex}_${level}`;
}

export async function loadCurrentDay(level: GrammarLevel): Promise<number> {
  const { value } = await Preferences.get({ key: currentDayKey(level) });
  const n = parseInt(value ?? '1', 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export async function loadDayIndex(level: GrammarLevel): Promise<number> {
  const { value } = await Preferences.get({ key: dayIndexKey(level) });
  const n = parseInt(value ?? '0', 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export async function saveDayProgress(
  level: GrammarLevel,
  day: number,
  indexInDay: number,
): Promise<void> {
  await Promise.all([
    Preferences.set({ key: currentDayKey(level), value: String(day) }),
    Preferences.set({ key: dayIndexKey(level), value: String(indexInDay) }),
    Preferences.set({ key: KEYS.index, value: String((day - 1) * LESSONS_PER_DAY + indexInDay) }),
  ]);
}

export async function loadCompletedDays(level: GrammarLevel): Promise<number[]> {
  const { value } = await Preferences.get({ key: completedDaysKey(level) });
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as number[];
    return Array.isArray(parsed) ? parsed.filter((d) => Number.isFinite(d) && d >= 1) : [];
  } catch {
    return [];
  }
}

export async function saveCompletedDays(level: GrammarLevel, days: number[]): Promise<void> {
  const unique = [...new Set(days)].sort((a, b) => a - b);
  await Preferences.set({ key: completedDaysKey(level), value: JSON.stringify(unique) });
}

function dayStudiedKey(level: GrammarLevel) {
  return `${KEYS.dayStudied}_${level}`;
}

export async function loadDayStudiedCounts(level: GrammarLevel): Promise<Record<number, number>> {
  const { value } = await Preferences.get({ key: dayStudiedKey(level) });
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as Record<string, number>;
    const out: Record<number, number> = {};
    for (const [k, v] of Object.entries(parsed)) {
      const day = parseInt(k, 10);
      if (Number.isFinite(day) && day >= 1 && Number.isFinite(v) && v >= 0) {
        out[day] = v;
      }
    }
    return out;
  } catch {
    return {};
  }
}

export async function saveDayStudiedCounts(
  level: GrammarLevel,
  counts: Record<number, number>,
): Promise<void> {
  const serial: Record<string, number> = {};
  for (const [k, v] of Object.entries(counts)) {
    serial[String(k)] = v;
  }
  await Preferences.set({ key: dayStudiedKey(level), value: JSON.stringify(serial) });
}

export async function loadMyGrammar(): Promise<string[]> {
  const { value } = await Preferences.get({ key: KEYS.myGrammar });
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveMyGrammar(ids: string[]): Promise<void> {
  await Preferences.set({ key: KEYS.myGrammar, value: JSON.stringify(ids) });
}

export async function loadNotificationSettings(): Promise<NotificationSettings> {
  const [enabledVal, hourVal, minuteVal] = await Promise.all([
    Preferences.get({ key: KEYS.notifyEnabled }),
    Preferences.get({ key: KEYS.notifyHour }),
    Preferences.get({ key: KEYS.notifyMinute }),
  ]);

  const hour = parseInt(hourVal.value ?? '9', 10);
  const minute = parseInt(minuteVal.value ?? '0', 10);

  return {
    enabled: enabledVal.value === 'true',
    hour: Number.isFinite(hour) && hour >= 0 && hour <= 23 ? hour : 9,
    minute: Number.isFinite(minute) && minute >= 0 && minute <= 59 ? minute : 0,
  };
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await Promise.all([
    Preferences.set({ key: KEYS.notifyEnabled, value: String(settings.enabled) }),
    Preferences.set({ key: KEYS.notifyHour, value: String(settings.hour) }),
    Preferences.set({ key: KEYS.notifyMinute, value: String(settings.minute) }),
  ]);
}
