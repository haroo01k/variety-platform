# 기후농사 (variety-platform)

기후에 강한 신품종을 농업인과 소비자에게 각각 맞는 방식으로 추천·홍보하는
반응형 웹 서비스입니다. 농업인에게는 지역·작물·농업 문제(기후위험)·재배
목적에 따른 신품종 추천을, 소비자에게는 작물별 취향 테스트와 신품종 카드를
제공합니다.

자세한 서비스 범위와 개발 단계는 [PROJECT.md](PROJECT.md)를,
AI 에이전트 공통 작업 규칙은 [AGENTS.md](AGENTS.md)를 참고하세요.

## 기술 스택

- [Vite](https://vite.dev/)
- [React](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) (v4, `@tailwindcss/vite` 플러그인 사용)
- [React Router](https://reactrouter.com/)
- npm

## 요구 사항

- Node.js 20 이상 (권장: LTS 버전)
- npm 10 이상

## 설치

```bash
npm install
```

## 개발 서버 실행

```bash
npm run dev
```

터미널에 출력되는 주소(기본값: `http://localhost:5173`)로 접속합니다.

## 빌드

```bash
npm run build
```

타입 체크(`tsc -b`) 후 `dist/` 폴더에 프로덕션 빌드 결과물을 생성합니다.

## 빌드 결과 미리보기

```bash
npm run preview
```

## 코드 검사(Lint)

```bash
npm run lint
```

## 폴더 구조

```
src/
  components/
    common/       공통 UI 컴포넌트 (Header, Layout, Button, Container 등)
    farmer/       농업인 화면 전용 컴포넌트
    consumer/     소비자 화면 전용 컴포넌트
  pages/
    HomePage.tsx  공통 시작 화면
    farmer/       농업인 조건 입력 · 분석 · 결과 화면
    consumer/     소비자 작물 선택 · 추천 카드 화면
  data/           작물·품종·질문 옵션 데이터 (src/data/varieties.ts가 25개 품종 원본)
  types/          공용 TypeScript 타입 정의
  lib/            라우트 상수, 추천 채점 로직, 좋아요(Supabase) 연동 유틸리티
supabase/         좋아요 기능용 SQL 스키마·RLS·함수, 설정 가이드
```

## 화면 흐름

```
/                    공통 시작 화면 (농업인 / 소비자 선택)
├─ /farmer                농업인 조건 입력 (지역·작물·농업 문제·재배 목적)
│   └─ /farmer/analyzing  분석 중 안내 화면
│       └─ /farmer/result 추천 결과 화면
└─ /consumer               소비자 작물 선택
    └─ /consumer/:cropId   소비자 추천 카드 화면
```

현재 단계에서는 위 화면들의 UI와 화면 이동만 구현되어 있으며, 실제 추천
로직·취향 테스트 로직·데이터베이스 연동은 포함되어 있지 않습니다. 모든
데이터는 `src/data`의 mock 데이터입니다.

## 환경 변수 (소비자 "좋아요" 기능 — Supabase)

소비자 취향 테스트 결과의 좋아요 기능은 Supabase를 사용합니다. `.env.example`을
`.env.local`로 복사한 뒤 값을 채워주세요(`.env.local`은 `.gitignore`에 포함되어
커밋되지 않습니다).

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=anon_public_key
```

- Supabase 프로젝트를 처음부터 만드는 방법과 필요한 테이블/함수 SQL은
  [supabase/README.md](supabase/README.md), [supabase/schema.sql](supabase/schema.sql)를 참고하세요.
- `service_role` 키는 절대 프런트엔드에 넣지 않습니다. 여기서 쓰는 건 공개 가능한
  `anon` 키뿐이며, 실제 데이터 접근은 SQL Editor로 만든 서버 측 함수를 통해서만 이루어집니다.
- 환경 변수가 없어도 앱은 정상 실행됩니다. 이 경우 좋아요 관련 영역(하트 버튼,
  농업인 화면의 소비자 관심도 코너, `/admin` 집계 화면)에만 "불러오지 못했어요" 안내가
  뜨고, 추천 결과 자체는 평소와 동일하게 동작합니다.
