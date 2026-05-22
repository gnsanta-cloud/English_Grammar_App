import type { GrammarLesson, GrammarQuizQuestion } from '../types';
import { getLessonsForDay } from './dailyPlan';

const BLANK = '___';

export function splitQuizSentence(sentence: string): { before: string; after: string } {
  const idx = sentence.indexOf(BLANK);
  if (idx < 0) {
    return { before: sentence, after: '' };
  }
  return {
    before: sentence.slice(0, idx),
    after: sentence.slice(idx + BLANK.length),
  };
}

export function lessonToQuizQuestions(lesson: GrammarLesson): GrammarQuizQuestion[] {
  return lesson.quizzes.map((q, i) => {
    const { before, after } = splitQuizSentence(q.sentence);
    return {
      id: `${lesson.id}-q${i}`,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      before,
      after,
      answer: q.answer,
      choices: q.choices,
    };
  });
}

export function getQuizQuestionsForDay(
  allLessons: GrammarLesson[],
  day: number,
): GrammarQuizQuestion[] {
  return getLessonsForDay(allLessons, day).flatMap(lessonToQuizQuestions);
}

export function shuffleChoices<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildShuffledQuestionPool(
  questions: GrammarQuizQuestion[],
): GrammarQuizQuestion[] {
  const copy = [...questions];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
