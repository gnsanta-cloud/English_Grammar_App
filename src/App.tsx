import { useCallback, useEffect, useState } from 'react';

import { App as CapApp } from '@capacitor/app';

import type { GrammarLevel, TabId } from './types';

import { installAndroidBackButton, setAndroidBackFallback } from './hooks/useAndroidBackButton';

import { useAppState } from './hooks/useAppState';

import { getLevelLabel } from './utils/grammar';

import { TabNav } from './components/TabNav';

import { HomeTab } from './components/HomeTab';

import { LearnTab } from './components/LearnTab';

import { QuizTab } from './components/QuizTab';

import { AvatarChatTab } from './components/AvatarChatTab';

import { MyGrammarTab } from './components/MyGrammarTab';

import { SettingsTab } from './components/SettingsTab';
import { AppSplash } from './components/AppSplash';
import { syncStudyReminderFromStorage } from './utils/localNotifications';

export default function App() {
  const [tab, setTab] = useState<TabId>('home');

  const {
    ready,
    level,
    changeLevel,
    lessons,
    dayLessons,
    currentDay,
    indexInDay,
    totalDays,
    completedDays,
    dayJustCompleted,
    clearDayJustCompleted,
    currentLesson,
    myGrammar,
    addToMyGrammar,
    removeFromMyGrammar,
    savedLessons,
    selectDay,
    firstIncompleteDay,
    getDayProgress,
    goNext,
    goPrevious,
    canGoBackCard,
  } = useAppState();

  const isSaved = currentLesson ? myGrammar.includes(currentLesson.id) : false;

  const handleSelectTopic = useCallback(
    async (newLevel: GrammarLevel) => {
      await changeLevel(newLevel);
    },
    [changeLevel],
  );

  const handleSystemBack = useCallback(() => {
    if (tab === 'home') {
      if (window.confirm('앱을 종료하시겠습니까?')) {
        void CapApp.exitApp();
      }
      return true;
    }
    if (tab === 'learn' && canGoBackCard) {
      goPrevious();
      return true;
    }
    setTab('home');
    return true;
  }, [tab, canGoBackCard, goPrevious]);

  useEffect(() => {
    installAndroidBackButton();
  }, []);

  useEffect(() => {
    setAndroidBackFallback(handleSystemBack);
  }, [handleSystemBack]);

  useEffect(() => {
    if (!ready) return;
    void syncStudyReminderFromStorage();
  }, [ready]);

  if (!ready) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>문법 데이터 불러오는 중...</p>
      </div>
    );
  }

  const headerTitle =
    tab === 'home'
      ? '영어 문법 홈'
      : tab === 'learn'
        ? `${getLevelLabel(level)} · ${currentDay}일차`
        : tab === 'quiz'
          ? '문법 퀴즈'
          : getLevelLabel(level);

  return (
    <div className="app">
      <AppSplash />

      <header className="app-header">
        <h1>{headerTitle}</h1>
      </header>

      <main className="app-main">
        {tab === 'home' && (
          <HomeTab
            level={level}
            wordCount={lessons.length}
            totalDays={totalDays}
            currentDay={currentDay}
            completedDays={completedDays}
            firstIncompleteDay={firstIncompleteDay}
            getDayProgress={getDayProgress}
            onSelectDay={selectDay}
            onStartLearning={() => setTab('learn')}
            onOpenSettings={() => setTab('settings')}
          />
        )}

        {tab === 'learn' && (
          <LearnTab
            lesson={currentLesson}
            levelLabel={getLevelLabel(level)}
            dayNumber={currentDay}
            indexInDay={indexInDay}
            dayLessonCount={dayLessons.length}
            saved={isSaved}
            dayJustCompleted={dayJustCompleted}
            onDismissDayComplete={clearDayJustCompleted}
            onNext={goNext}
            onPrevious={goPrevious}
            onSave={() => currentLesson && addToMyGrammar(currentLesson.id)}
          />
        )}

        {tab === 'quiz' && (
          <QuizTab
            allLessons={lessons}
            topicLabel={getLevelLabel(level)}
            totalDays={totalDays}
            currentDay={currentDay}
            completedDays={completedDays}
            onWrongAnswer={addToMyGrammar}
          />
        )}

        {tab === 'conversation' && <AvatarChatTab level={level} />}

        {tab === 'mygrammar' && (
          <MyGrammarTab savedLessons={savedLessons} onRemove={removeFromMyGrammar} />
        )}

        {tab === 'settings' && (
          <SettingsTab
            level={level}
            lessonCount={lessons.length}
            onSelectTopic={handleSelectTopic}
          />
        )}
      </main>

      <TabNav active={tab} onChange={setTab} />
    </div>
  );
}
