import { useCallback, useEffect, useMemo, useState } from 'react';
import { App as CapApp } from '@capacitor/app';
import type { GrammarLevel } from '../types';
import {
  LESSONS_PER_DAY,
  getDayLessonCount,
  getTotalDays,
  getLessonsForDay,
  indexToDayPlan,
} from '../utils/dailyPlan';
import {
  loadCompletedDays,
  loadCurrentDay,
  loadDayIndex,
  loadDayStudiedCounts,
  loadIndex,
  loadLevel,
  loadMyGrammar,
  saveCompletedDays,
  saveDayProgress,
  saveDayStudiedCounts,
  saveLevel,
  saveMyGrammar,
} from '../utils/storage';
import { getAllBankLessons, getLessonsByLevel, loadGrammarBank } from '../utils/grammar';

export function useAppState() {
  const [ready, setReady] = useState(false);
  const [level, setLevel] = useState<GrammarLevel>('middle');
  const [currentDay, setCurrentDay] = useState(1);
  const [indexInDay, setIndexInDay] = useState(0);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [dayStudiedCounts, setDayStudiedCounts] = useState<Record<number, number>>({});
  const [myGrammar, setMyGrammar] = useState<string[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const [lessonsLoaded, setLessonsLoaded] = useState(false);
  const [dayJustCompleted, setDayJustCompleted] = useState<number | null>(null);

  const lessons = getLessonsByLevel(level);
  const totalDays = getTotalDays(lessons.length);
  const dayLessons = useMemo(() => getLessonsForDay(lessons, currentDay), [lessons, currentDay]);
  const currentLesson = dayLessons[indexInDay] ?? null;

  const recordStudied = useCallback(
    async (day: number, count: number) => {
      const total = getDayLessonCount(lessons, day);
      const capped = Math.min(Math.max(count, 0), total);
      setDayStudiedCounts((prev) => {
        const next = Math.max(prev[day] ?? 0, capped);
        if (next === (prev[day] ?? 0)) return prev;
        const merged = { ...prev, [day]: next };
        void saveDayStudiedCounts(level, merged);
        return merged;
      });
    },
    [level, lessons],
  );

  const getStudiedCount = useCallback(
    (day: number) => {
      const total = getDayLessonCount(lessons, day);
      if (completedDays.includes(day)) return total;
      const stored = dayStudiedCounts[day] ?? 0;
      if (day === currentDay) return Math.max(stored, indexInDay + 1);
      return Math.min(stored, total);
    },
    [lessons, completedDays, dayStudiedCounts, currentDay, indexInDay],
  );

  const persistProgress = useCallback(
    (day: number, idx: number) => {
      void saveDayProgress(level, day, idx);
      void recordStudied(day, idx + 1);
    },
    [level, recordStudied],
  );

  useEffect(() => {
    (async () => {
      await loadGrammarBank();
      setLessonsLoaded(true);
      const [savedLevel, flatIndex, savedBookmarks] = await Promise.all([
        loadLevel(),
        loadIndex(),
        loadMyGrammar(),
      ]);

      const [savedDay, savedIdx, savedCompleted, savedStudied] = await Promise.all([
        loadCurrentDay(savedLevel),
        loadDayIndex(savedLevel),
        loadCompletedDays(savedLevel),
        loadDayStudiedCounts(savedLevel),
      ]);

      const list = getLessonsByLevel(savedLevel);
      const days = getTotalDays(list.length);

      let day = savedDay;
      let idx = savedIdx;

      if (savedDay === 1 && savedIdx === 0 && flatIndex > 0) {
        const migrated = indexToDayPlan(flatIndex);
        day = Math.min(migrated.day, Math.max(1, days));
        idx = Math.min(migrated.indexInDay, getDayLessonCount(list, day) - 1);
        await saveDayProgress(savedLevel, day, idx);
      }

      day = Math.min(Math.max(1, day), Math.max(1, days));
      idx = Math.min(Math.max(0, idx), Math.max(0, getDayLessonCount(list, day) - 1));

      const studied = { ...savedStudied };
      const dayTotal = getDayLessonCount(list, day);
      if (savedCompleted.includes(day)) {
        studied[day] = dayTotal;
      } else {
        studied[day] = Math.max(studied[day] ?? 0, idx + 1);
      }

      setLevel(savedLevel);
      setCurrentDay(day);
      setIndexInDay(idx);
      setCompletedDays(savedCompleted);
      setDayStudiedCounts(studied);
      setMyGrammar(savedBookmarks);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    persistProgress(currentDay, indexInDay);
  }, [currentDay, indexInDay, ready, persistProgress]);

  useEffect(() => {
    if (!ready) return;

    const pauseListener = CapApp.addListener('pause', () => {
      persistProgress(currentDay, indexInDay);
    });

    const stateListener = CapApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) persistProgress(currentDay, indexInDay);
    });

    const beforeUnload = () => persistProgress(currentDay, indexInDay);
    window.addEventListener('beforeunload', beforeUnload);

    return () => {
      pauseListener.then((l) => l.remove());
      stateListener.then((l) => l.remove());
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [currentDay, indexInDay, ready, persistProgress]);

  const markDayComplete = useCallback(
    async (day: number) => {
      if (completedDays.includes(day)) return;
      const total = getDayLessonCount(lessons, day);
      const next = [...completedDays, day].sort((a, b) => a - b);
      setCompletedDays(next);
      await saveCompletedDays(level, next);
      await recordStudied(day, total);
      setDayJustCompleted(day);
    },
    [completedDays, level, lessons, recordStudied],
  );

  const clearDayJustCompleted = useCallback(() => setDayJustCompleted(null), []);

  const changeLevel = useCallback(async (newLevel: GrammarLevel) => {
    await saveLevel(newLevel);
    const [day, idx, completed, studied] = await Promise.all([
      loadCurrentDay(newLevel),
      loadDayIndex(newLevel),
      loadCompletedDays(newLevel),
      loadDayStudiedCounts(newLevel),
    ]);
    const list = getLessonsByLevel(newLevel);
    const days = getTotalDays(list.length);
    const safeDay = Math.min(Math.max(1, day), Math.max(1, days));
    const safeIdx = Math.min(Math.max(0, idx), Math.max(0, getDayLessonCount(list, safeDay) - 1));

    setLevel(newLevel);
    setCurrentDay(safeDay);
    setIndexInDay(safeIdx);
    setCompletedDays(completed);
    setDayStudiedCounts(studied);
    setHistory([]);
    setDayJustCompleted(null);
    await saveDayProgress(newLevel, safeDay, safeIdx);
  }, []);

  const selectDay = useCallback(
    async (day: number) => {
      const safeDay = Math.min(Math.max(1, day), Math.max(1, totalDays));
      const total = getDayLessonCount(lessons, safeDay);
      const stored = dayStudiedCounts[safeDay] ?? 0;
      const studied = completedDays.includes(safeDay) ? total : stored;
      let startIdx = 0;
      if (!completedDays.includes(safeDay) && studied > 0 && studied < total) {
        startIdx = Math.min(studied, total - 1);
      }

      setCurrentDay(safeDay);
      setIndexInDay(startIdx);
      setHistory([]);
      setDayJustCompleted(null);
      await saveDayProgress(level, safeDay, startIdx);
      if (startIdx > 0) await recordStudied(safeDay, startIdx + 1);
    },
    [level, totalDays, lessons, completedDays, dayStudiedCounts, recordStudied],
  );

  const addToMyGrammar = useCallback(
    async (lessonId: string) => {
      if (myGrammar.includes(lessonId)) return;
      const next = [...myGrammar, lessonId];
      setMyGrammar(next);
      await saveMyGrammar(next);
    },
    [myGrammar],
  );

  const removeFromMyGrammar = useCallback(
    async (lessonId: string) => {
      const next = myGrammar.filter((id) => id !== lessonId);
      setMyGrammar(next);
      await saveMyGrammar(next);
    },
    [myGrammar],
  );

  const savedLessons = getAllBankLessons().filter((l) => myGrammar.includes(l.id));

  const goNext = useCallback(() => {
    const lastIndex = dayLessons.length - 1;
    if (indexInDay < lastIndex) {
      setIndexInDay((prev) => {
        const next = prev + 1;
        setHistory((h) => [...h, prev]);
        void recordStudied(currentDay, next + 1);
        return next;
      });
      return;
    }
    void markDayComplete(currentDay);
  }, [dayLessons.length, indexInDay, currentDay, markDayComplete, recordStudied]);

  const goPrevious = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setIndexInDay(prev);
      return h.slice(0, -1);
    });
  }, []);

  const firstIncompleteDay = useMemo(() => {
    for (let d = 1; d <= totalDays; d++) {
      if (!completedDays.includes(d)) return d;
    }
    return totalDays > 0 ? totalDays : 1;
  }, [totalDays, completedDays]);

  const getDayProgress = useCallback(
    (day: number) => {
      const total = getDayLessonCount(lessons, day);
      const studied = getStudiedCount(day);
      return { studied, total };
    },
    [lessons, getStudiedCount],
  );

  return {
    ready: ready && lessonsLoaded,
    level,
    changeLevel,
    lessons,
    dayLessons,
    currentDay,
    indexInDay,
    totalDays,
    lessonsPerDay: LESSONS_PER_DAY,
    completedDays,
    dayJustCompleted,
    clearDayJustCompleted,
    currentLesson,
    myGrammar,
    savedLessons,
    addToMyGrammar,
    removeFromMyGrammar,
    selectDay,
    markDayComplete,
    firstIncompleteDay,
    getDayProgress,
    goNext,
    goPrevious,
    canGoBackCard: history.length > 0,
  };
};
