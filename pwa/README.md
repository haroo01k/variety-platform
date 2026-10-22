# 기후농사 PWA(설치형 웹앱) 설정

기존 웹사이트 코드와 분리해서, PWA에 필요한 파일만 아래 위치에서 관리합니다.

| 파일 | 역할 |
| --- | --- |
| `public/manifest.webmanifest` | 앱 이름(기후농사), 시작 경로, 표시 방식, 색상, 아이콘 목록 |
| `public/icons/` | 앱 아이콘 전부 (이 폴더의 이미지만 바꾸면 아이콘 교체 완료) |
| `public/sw.js` | Service Worker (캐싱·오프라인 처리) |
| `pwa/serviceWorkerPlugin.ts` | 빌드 시 `dist/sw.js`에 빌드 ID와 해시된 JS/CSS 목록을 넣는 Vite 플러그인 |
| `src/lib/pwa.ts` | Service Worker 등록 (프로덕션 빌드에서만) |
| `src/components/common/AppStatusBanner.tsx` | 오프라인 / 새 버전 안내 배너 (해당 상황에서만 표시) |
| `index.html` `<head>` | manifest 연결, iOS 홈 화면용 메타 태그, 파비콘 |
| `vercel.json` `headers` | `sw.js`, `manifest.webmanifest`가 HTTP 캐시에 묶이지 않도록 설정 |

새 패키지는 추가하지 않았습니다(vite-plugin-pwa/workbox 없이 직접 작성).

## 앱 아이콘 교체 방법

`public/icons/` 안의 파일을 **같은 파일명·같은 크기의 PNG**로 덮어쓰면 됩니다.
코드 수정은 필요 없습니다.

| 파일명 | 크기 | 용도 / 주의 |
| --- | --- | --- |
| `icon-192.png` | 192×192 | 일반 아이콘 (PC 설치, Android). 투명 배경 가능 |
| `icon-512.png` | 512×512 | 일반 아이콘 (스플래시 화면, 설치 창) |
| `icon-maskable-192.png` | 192×192 | Android 적응형 아이콘. **배경을 끝까지 채우고**, 로고·글자는 가운데 지름 80% 원 안에만 배치 (기기마다 원/둥근 사각형 등으로 잘림) |
| `icon-maskable-512.png` | 512×512 | 위와 동일 |
| `apple-touch-icon.png` | 180×180 | iOS 홈 화면. **투명 배경 금지**(검게 보임), 모서리는 iOS가 자동으로 둥글게 처리 |
| `favicon-32.png` | 32×32 | 브라우저 탭 아이콘 |

교체 후 확인 사항

1. `npm run build` 후 배포합니다. (배포마다 Service Worker 캐시가 새로 만들어집니다.)
2. 이미 설치한 기기는 아이콘이 바로 바뀌지 않을 수 있습니다.
   - Android Chrome: 보통 하루 안에 자동 갱신
   - PC Chrome/Edge: 앱을 다시 실행하면 갱신 확인 (변경 확인 창이 뜰 수 있음)
   - iOS: 자동 갱신되지 않으므로 홈 화면에서 삭제 후 다시 추가
3. maskable 아이콘 안전 영역 확인: https://maskable.app/editor

임시 아이콘은 브랜드 그린(#2f7d45) 배경에 '기후농사' 글자(나눔손글씨 할머니체)로
만든 것입니다. 아이콘은 홈페이지 화면(헤더 로고 등)에는 쓰이지 않으므로 교체해도 UI에
영향이 없습니다.

## 캐싱 전략 (sw.js)

| 요청 | 전략 | 이유 |
| --- | --- | --- |
| 페이지 이동(HTML) | 네트워크 우선, 오프라인일 때만 저장본 | 온라인이면 항상 최신 배포 화면 |
| `/assets/*` (해시 파일명 JS/CSS) | 캐시 우선 | 내용이 바뀌면 파일명이 바뀌므로 오래된 코드가 남지 않음 |
| `/images`, `/fonts`, `/icons` | 캐시 우선 + 백그라운드 갱신 | 오프라인에서도 이미지 표시 |
| Supabase 등 외부 요청, POST 등 | **관여하지 않음(캐시 안 함)** | 좋아요 수 등 실시간 데이터가 오래된 값으로 보이지 않도록 |

- 추천 로직과 품종 데이터는 JS 번들에 포함되어 있어 HTML과 함께 항상 최신 버전이 적용됩니다.
- 캐시 이름에 빌드 ID가 들어가서, 새 버전이 설치되면 이전 배포의 캐시는 모두 삭제됩니다.
  화면에는 "새 버전이 준비됐어요 [새로고침]" 안내가 뜹니다(작성 중인 입력을 잃지 않도록 자동 새로고침은 하지 않음).
- 보관함·좋아요 기록 등 `localStorage` 데이터는 Service Worker가 건드리지 않으므로 그대로 유지됩니다.
- 개발 서버(`npm run dev`)에서는 Service Worker를 등록하지 않습니다.
  PWA 동작 확인은 `npm run build && npm run preview`로 합니다.

## 설치 방법 (배포된 HTTPS 주소에서)

PWA 설치는 **HTTPS 주소**(또는 개발 PC의 `http://localhost`)에서만 가능합니다.
Vercel 배포 주소는 기본적으로 HTTPS입니다.

- **PC (Chrome / Edge)**: 주소창 오른쪽의 설치 아이콘(모니터+화살표) 클릭 →
  "설치". 또는 메뉴(⋮ / …) → "앱 설치" / "앱 → 이 사이트를 앱으로 설치".
  설치 후 바탕화면·시작 메뉴에 '기후농사' 아이콘이 생깁니다.
- **Android (Chrome)**: 메뉴(⋮) → "앱 설치" 또는 "홈 화면에 추가" → "설치".
  홈 화면/앱 서랍에 '기후농사' 아이콘이 생깁니다.
- **iOS / iPadOS (Safari)**: 하단 공유 버튼(□↑) → "홈 화면에 추가" → 이름이
  '기후농사'인지 확인 후 "추가". (iOS 16.4 이상은 Chrome 등 다른 브라우저의 공유 메뉴에서도 가능)

## 향후 앱스토어 출시 시 필요한 작업 (현재 단계에서는 진행하지 않음)

공통

- 최종 앱 아이콘·스플래시 이미지 확정 (스토어용 1024×1024 아이콘 포함)
- 개인정보처리방침 페이지 URL 준비 (좋아요 기능이 기기별 익명 ID를 저장하므로 필요)
- `/admin` 화면 접근 제한(인증) 적용 — 스토어 심사 전 필수
- 고정 도메인 확보 (앱이 가리킬 운영 주소)

Android (Google Play)

- 가장 간단한 방법: 현재 PWA를 **TWA(Trusted Web Activity)**로 감싸기
  (Bubblewrap CLI 또는 PWABuilder 사용). 웹 코드 수정이 거의 필요 없습니다.
- `public/.well-known/assetlinks.json`에 앱 서명 키 지문 등록 (도메인 소유 확인)
- Google Play 개발자 계정(1회 등록비), 스토어 등록 정보·스크린샷 작성

iOS (App Store)

- iOS는 PWA를 그대로 올릴 수 없어 **Capacitor** 등으로 네이티브 앱 셸을 만들어야 합니다.
  - `npm install @capacitor/core @capacitor/cli @capacitor/ios` → `npx cap init` →
    `webDir`을 `dist`로 지정 → `npx cap add ios`
  - Capacitor 앱에서는 Service Worker가 필요 없으므로(파일이 앱에 포함) `src/lib/pwa.ts`의
    등록을 네이티브 환경에서 건너뛰도록 분기 추가
  - 공유 기능(`src/lib/share.ts`)은 `@capacitor/share` 플러그인으로 대체 검토
  - Supabase 요청 출처가 `capacitor://localhost`가 되므로 CORS 설정 확인
- Mac + Xcode, Apple Developer Program(연 회비) 필요
- 웹사이트를 그대로 감싼 앱은 심사에서 반려될 수 있어(가이드라인 4.2), 앱만의 기능
  (예: 알림, 오프라인 보관함 등) 보강을 고려
