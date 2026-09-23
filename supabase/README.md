# Supabase 설정 가이드 (소비자 "좋아요" 기능)

이 프로젝트는 아직 Supabase 프로젝트가 없다는 전제로, 처음부터 만드는 방법을 안내합니다.
계정/프로젝트 생성은 브라우저에서 직접 해주셔야 합니다(에이전트가 대신 할 수 없는 단계).

## 1. 프로젝트 만들기 (무료 플랜으로 충분)

1. https://supabase.com 접속 → "Start your project" → GitHub 등으로 로그인
2. "New project" 클릭
   - Name: 아무 이름 (예: `climate-farming`)
   - Database Password: 강한 비밀번호로 설정 후 따로 보관(비밀번호 관리자 등). 이 비밀번호는
     이번 기능에는 직접 쓰이지 않지만 나중에 DB에 직접 접속할 때 필요합니다.
   - Region: `Northeast Asia (Seoul)` 권장
3. 프로젝트 생성 완료까지 1~2분 정도 걸립니다.

## 2. 테이블·함수 만들기

1. 왼쪽 메뉴에서 **SQL Editor** 클릭 → "New query"
2. 이 저장소의 [`supabase/schema.sql`](./schema.sql) 파일 내용을 전체 복사해서 붙여넣기
3. 우측 하단 "Run" 클릭 → 에러 없이 완료되면 성공
   - `variety_likes` 테이블과 `get_like_counts` / `get_my_likes` / `toggle_like` 함수가 만들어집니다.
4. (확인용) 왼쪽 메뉴 **Table Editor**에서 `variety_likes` 테이블이 보이면 정상입니다.

## 3. anon key 발급받기

1. 왼쪽 메뉴 **Project Settings** → **API**
2. 아래 두 값을 복사해둡니다.
   - **Project URL** (예: `https://abcdxyz.supabase.co`)
   - **anon public** key (긴 문자열. **`service_role` 키는 절대 사용하지 마세요** —
     이름에 "service_role"이라고 적힌 키는 관리자 권한이라 프런트엔드에 넣으면 안 됩니다)

## 4. 프로젝트에 연결하기

저장소 루트에 `.env.local` 파일을 만들고(이미 `.gitignore`에 포함되어 커밋되지 않습니다),
[`.env.example`](../.env.example)을 참고해 값을 채웁니다.

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://abcdxyz.supabase.co
VITE_SUPABASE_ANON_KEY=여기에_anon_public_key_붙여넣기
```

저장 후 개발 서버를 껐다가 다시 켜면(`npm run dev`) 반영됩니다.

## 5. 잘 연결됐는지 확인하는 법

- 소비자 취향 테스트 결과 화면에서 하트 버튼을 눌렀을 때 숫자가 바뀌고, 새로고침해도 하트가
  채워진 상태로 유지되면 정상 연결된 것입니다.
- 연결이 안 돼 있거나 실패하면 하트 버튼 아래에 "좋아요를 처리하지 못했어요. 다시 시도해주세요."
  라는 안내만 뜨고, 나머지 추천 결과 화면은 평소와 동일하게 동작합니다(의도된 동작입니다).
- Supabase 대시보드 **Table Editor → variety_likes**에서 실제로 행이 쌓이는지 확인할 수 있습니다.

## 참고: 이 설계가 막는 것 / 막지 못하는 것

- **막는 것**: 같은 브라우저(같은 device_id)로 같은 품종에 중복으로 좋아요가 쌓이는 것
  (DB unique 제약), 여러 명이 동시에 눌러도 집계가 꼬이는 것(서버 함수에서 항상 다시 세어 반환).
- **막지 못하는 것**: 로그인이 없는 익명 설계이므로, 브라우저 저장 데이터를 지우고 다시 방문하면
  같은 사람이 같은 품종에 또 좋아요를 누를 수 있습니다. 이는 요청하신 설계상 허용된 한계입니다.
