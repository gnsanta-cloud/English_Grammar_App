import type { GrammarLesson } from '../types';
import { GrammarCard } from './GrammarCard';

interface LearnTabProps {
  lesson: GrammarLesson | null;
  levelLabel: string;
  dayNumber: number;
  indexInDay: number;
  dayLessonCount: number;
  saved: boolean;
  dayJustCompleted: number | null;
  onDismissDayComplete: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSave: () => void;
}

export function LearnTab({
  lesson,
  levelLabel,
  dayNumber,
  indexInDay,
  dayLessonCount,
  saved,
  dayJustCompleted,
  onDismissDayComplete,
  onNext,
  onPrevious,
  onSave,
}: LearnTabProps) {
  if (!lesson) {
    return (
      <div className="empty-state">
        <p>이 일차에 학습할 문법이 없습니다.</p>
      </div>
    );
  }

  const isLast = indexInDay >= dayLessonCount - 1;

  return (
    <section className="learn-tab">
      {dayJustCompleted !== null && (
        <div className="learn-day-complete-banner" role="status">
          <p>
            <strong>{dayJustCompleted}일차 완료!</strong> 잘했어요 🎉
          </p>
          <button type="button" className="learn-day-complete-btn" onClick={onDismissDayComplete}>
            확인
          </button>
        </div>
      )}

      <header className="learn-header">
        <span className="level-chip">{levelLabel}</span>
        <span className="learn-day-chip">{dayNumber}일차</span>
        <span className="progress-text">
          {indexInDay + 1} / {dayLessonCount}
        </span>
      </header>

      {isLast && dayJustCompleted === null && (
        <p className="learn-last-hint">마지막 주제입니다. 다음으로 넘기면 일차가 완료됩니다.</p>
      )}

      <GrammarCard
        lesson={lesson}
        onSwipeLeft={onNext}
        onSwipeRight={onPrevious}
        onSwipeUp={onSave}
        saved={saved}
      />
    </section>
  );
}
