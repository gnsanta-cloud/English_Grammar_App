import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GrammarQuizQuestion } from '../types';
import { useBackHandler } from '../hooks/useAndroidBackButton';
import { getDayStatus, getDayLessonCount, getDayQuizCount } from '../utils/dailyPlan';
import {
  buildShuffledQuestionPool,
  getQuizQuestionsForDay,
  shuffleChoices,
} from '../utils/grammarQuiz';
import type { GrammarLesson } from '../types';
import { ConfettiCelebration } from './ConfettiCelebration';

const POINTS_PER_QUESTION = 10;

type QuizPhase = 'daySelect' | 'playing' | 'finished';

interface QuizTabProps {
  allLessons: GrammarLesson[];
  topicLabel: string;
  totalDays: number;
  currentDay: number;
  completedDays: number[];
  onWrongAnswer: (lessonId: string) => void;
}

export function QuizTab({
  allLessons,
  topicLabel,
  totalDays,
  currentDay,
  completedDays,
  onWrongAnswer,
}: QuizTabProps) {
  const [phase, setPhase] = useState<QuizPhase>('daySelect');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [questions, setQuestions] = useState<GrammarQuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const clearQuizRun = useCallback(() => {
    setQuestions([]);
    setCurrent(0);
    setScore(0);
    setCorrectCount(0);
    setSelected(null);
    setShowCelebration(false);
  }, []);

  const resetToDaySelect = useCallback(() => {
    setPhase('daySelect');
    setSelectedDay(null);
    clearQuizRun();
  }, [clearQuizRun]);

  const startDayQuiz = useCallback(
    (day: number) => {
      const pool = getQuizQuestionsForDay(allLessons, day);
      if (pool.length === 0) return;
      setSelectedDay(day);
      setQuestions(buildShuffledQuestionPool(pool));
      setCurrent(0);
      setScore(0);
      setCorrectCount(0);
      setSelected(null);
      setShowCelebration(false);
      setPhase('playing');
    },
    [allLessons],
  );

  useEffect(() => {
    resetToDaySelect();
  }, [allLessons, topicLabel, totalDays, resetToDaySelect]);

  useBackHandler(() => {
    if (phase === 'daySelect') return false;
    resetToDaySelect();
    return true;
  }, phase !== 'daySelect');

  const currentQ = questions[current];
  const totalQuestions = questions.length;
  const maxScore = totalQuestions * POINTS_PER_QUESTION;

  const options = useMemo(() => {
    if (!currentQ) return [];
    const wrong = currentQ.choices.filter((c) => c !== currentQ.answer);
    const pick = shuffleChoices(wrong).slice(0, Math.min(3, wrong.length));
    return shuffleChoices([currentQ.answer, ...pick]);
  }, [currentQ]);

  if (phase === 'daySelect') {
    return (
      <section className="quiz-tab">
        <div className="quiz-intro quiz-intro-compact">
          <h2>문법 퀴즈</h2>
          <p className="quiz-topic-badge">
            {topicLabel} · {totalDays}일차
          </p>
          <p>일차를 선택하세요. 문장의 괄호 ( ) 안에 들어갈 맞는 표현을 고릅니다.</p>
        </div>

        <div className="home-progress-section quiz-day-section">
          <div className="home-progress-head">
            <h3>일차별 퀴즈</h3>
          </div>
          <ul className="home-day-list">
            {Array.from({ length: totalDays }, (_, i) => {
              const day = i + 1;
              const status = getDayStatus(day, completedDays, currentDay);
              const quizCount = getDayQuizCount(allLessons, day);
              const lessonCount = getDayLessonCount(allLessons, day);

              return (
                <li key={day}>
                  <button
                    type="button"
                    className={`home-day-item ${status}`}
                    disabled={status === 'locked' || quizCount === 0}
                    onClick={() => startDayQuiz(day)}
                  >
                    <span className="home-day-num">{day}일차 퀴즈</span>
                    <span className="home-day-meta">
                      {quizCount}문제 · {lessonCount}주제
                    </span>
                    <span className="home-day-badge">
                      {status === 'completed' && '완료'}
                      {status === 'current' && '학습 중'}
                      {status === 'available' && '시작'}
                      {status === 'locked' && '잠금'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    );
  }

  if (phase === 'finished' && selectedDay !== null) {
    const perfect = correctCount === totalQuestions && totalQuestions > 0;
    return (
      <section className="quiz-tab">
        {showCelebration && <ConfettiCelebration />}
        <div className="quiz-result">
          <h2>퀴즈 결과</h2>
          <p className="quiz-result-mode">
            괄호 빈칸 객관식 · {selectedDay}일차
          </p>
          <div className="quiz-result-stats">
            <div className="quiz-result-stat">
              <span className="quiz-result-stat-label">정답</span>
              <span className="quiz-result-stat-value">
                {correctCount}/{totalQuestions}
              </span>
            </div>
            <div className="quiz-result-stat">
              <span className="quiz-result-stat-label">점수</span>
              <span className="quiz-result-stat-value quiz-result-score">
                {score}/{maxScore}점
              </span>
            </div>
          </div>
          {perfect && <p className="celebration-text">참 잘했어요! 🎉</p>}
          <button type="button" className="primary-btn" onClick={() => startDayQuiz(selectedDay)}>
            다시 하기
          </button>
          <button type="button" className="quiz-back-link" onClick={resetToDaySelect}>
            일차 목록으로
          </button>
        </div>
      </section>
    );
  }

  if (!currentQ) return null;

  const isLast = current + 1 >= totalQuestions;
  const isCorrect = selected === currentQ.answer;
  const hasAnswered = !!selected;

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    if (option !== currentQ.answer) onWrongAnswer(currentQ.lessonId);
  };

  const handleNext = () => {
    const points = hasAnswered && isCorrect ? POINTS_PER_QUESTION : 0;
    const newCorrect = correctCount + (hasAnswered && isCorrect ? 1 : 0);
    const newScore = score + points;

    if (isLast) {
      setCorrectCount(newCorrect);
      setScore(newScore);
      setPhase('finished');
      if (newCorrect === totalQuestions) setShowCelebration(true);
      return;
    }
    setCorrectCount(newCorrect);
    setScore(newScore);
    setCurrent((c) => c + 1);
    setSelected(null);
  };

  return (
    <section className="quiz-tab">
      <div className="quiz-status-panel">
        <div className="quiz-status-row">
          <span className="quiz-status-label">진행</span>
          <span className="quiz-status-value quiz-status-progress">
            {current + 1}/{totalQuestions}
          </span>
        </div>
        <div className="quiz-status-row">
          <span className="quiz-status-label">점수</span>
          <span className="quiz-status-value quiz-status-score">
            {score}/{maxScore}점
          </span>
        </div>
        <div className="quiz-status-tags">
          <span className="quiz-mode-label">{selectedDay}일차</span>
          <span className="quiz-mode-label">{currentQ.lessonTitle}</span>
          <span className="quiz-mode-label">정답 {correctCount}</span>
        </div>
      </div>

      <div className="quiz-card">
        <p className="quiz-grammar-topic">{currentQ.lessonTitle}</p>
        <p className="quiz-fill-prompt">괄호 ( ) 안에 알맞은 말을 고르세요.</p>

        <p className="quiz-fill-sentence">
          {currentQ.before}
          <span className="quiz-fill-blank">
            ({' '}
            {selected ? (isCorrect ? currentQ.answer : selected) : '?'}
            {' '})
          </span>
          {currentQ.after}
        </p>

        <div className="quiz-options">
          {options.map((opt: string) => {
            let cls = 'quiz-option';
            if (selected) {
              if (opt === currentQ.answer) cls += ' correct';
              else if (opt === selected) cls += ' wrong';
            }
            return (
              <button
                key={opt}
                type="button"
                className={cls}
                onClick={() => handleSelect(opt)}
                disabled={!!selected}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {hasAnswered && (
          <div className="quiz-feedback">
            <p>{isCorrect ? '정답입니다!' : '오답 — 나의 문법 노트에 저장했어요'}</p>
            {!isCorrect && (
              <p className="quiz-correct-answer">
                정답: ({currentQ.answer})
              </p>
            )}
            <button type="button" className="primary-btn" onClick={handleNext}>
              {isLast ? '결과 보기' : '다음 문제'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
