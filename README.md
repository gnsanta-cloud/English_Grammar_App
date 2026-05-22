# Julia Grammar — 영어 문법 하이브리드 앱

[English_Hybrid_App](../English_Hybrid_App)와 동일한 **React + Vite + Capacitor** 구조의 영어 **문법** 학습 앱입니다.

## 주요 기능

- **학습 홈** — 일차별 문법 목록, 하단 고정 「학습 시작」 버튼
- **카드 학습** — 문법 주제 · 규칙 · 예문 (스와이프, TTS)
- **문법 퀴즈** — 일차별 선택, 객관식(주제→규칙 / 규칙→영문), 주관식
- **나의 문법 노트** — 오답·북마크 저장
- **AI 대화** — Julia 튜터 (문법 연습 프롬프트)
- **설정** — 중학/고등/기초/실용 주제, 학습 알림

## 앱 ID (단어 앱과 별도 설치)

| 항목 | 값 |
|------|-----|
| Package | `com.english.grammarapp` |
| 앱 이름 | Julia Grammar |

## 개발 실행

```powershell
cd English_Grammar_App
npm install
npm run dev
```

## Android 빌드

```powershell
npm run build
npx cap sync android
cd android
.\gradlew installDebug
```

Android Studio는 **`android` 폴더만** 엽니다. 자세한 내용은 [docs/ANDROID_STUDIO_RUN.md](docs/ANDROID_STUDIO_RUN.md) 참고.

## 문법 데이터 추가

`src/data/*.json` 및 `public/data/*.json`에 동일 형식으로 항목을 추가합니다.

```json
{
  "title": "현재완료",
  "rule": "have/has + p.p.",
  "example": "I have finished my work.",
  "exampleKo": "나는 일을 끝냈다."
}
```

- `middleGrammar.json` — 중학
- `highGrammar.json` — 고등
- `basicGrammar.json` — 기초
- `practicalGrammar.json` — 실용

하루 **1개 주제** = 1일차 (`src/utils/dailyPlan.ts`의 `LESSONS_PER_DAY`).

## 프로젝트 구조

```
English_Grammar_App/
├── src/
│   ├── components/   # HomeTab, LearnTab, QuizTab, GrammarCard, ...
│   ├── hooks/        # useAppState
│   ├── utils/        # grammar.ts, dailyPlan.ts, storage.ts
│   └── data/         # 문법 JSON
├── android/          # Capacitor Android
└── capacitor.config.ts
```

## GitHub

새 저장소를 만든 뒤 push 하세요 (예: `English_Grammar_App`).
