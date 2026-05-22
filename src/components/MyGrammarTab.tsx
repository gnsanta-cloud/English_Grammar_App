import type { GrammarLesson } from '../types';
import { speakEnglish } from '../utils/speech';

interface MyGrammarTabProps {
  savedLessons: GrammarLesson[];
  onRemove: (lessonId: string) => void;
}

export function MyGrammarTab({ savedLessons, onRemove }: MyGrammarTabProps) {
  if (savedLessons.length === 0) {
    return (
      <section className="mywords-tab">
        <h2>나의 문법 노트</h2>
        <p className="empty-hint">카드 스와이프나 퀴즈 오답 시 문법이 여기에 저장됩니다.</p>
      </section>
    );
  }

  return (
    <section className="mywords-tab">
      <h2>나의 문법 노트 ({savedLessons.length})</h2>
      <ul className="mywords-list">
        {savedLessons.map((l) => (
          <li key={l.id} className="myword-item">
            <div className="myword-main">
              <strong>{l.title}</strong>
              <span>{l.rule}</span>
            </div>
            <div className="myword-actions">
              <button type="button" onClick={() => speakEnglish(l.example)} aria-label="예문 발음">
                🔊
              </button>
              <button type="button" className="remove-btn" onClick={() => onRemove(l.id)}>
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
