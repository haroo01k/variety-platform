/**
 * 기후농사 Service Worker
 *
 * 아래 두 자리표시자는 `npm run build` 때 pwa/serviceWorkerPlugin.ts가
 * dist/sw.js에서 실제 값으로 바꿉니다. (개발 서버에서는 Service Worker를 등록하지 않습니다.)
 *  - BUILD_ID: 배포마다 달라지는 값 → sw.js 내용이 바뀌어 브라우저가 새 버전을 감지하고,
 *    이전 배포의 캐시는 activate 단계에서 모두 삭제됩니다.
 *  - PRECACHE_ASSETS: 이번 빌드의 해시된 JS/CSS 파일 목록 → 첫 방문 직후부터 오프라인 실행 가능.
 *
 * 캐싱 전략
 *  - 페이지(HTML) 요청: 네트워크 우선. 온라인이면 항상 최신 화면, 오프라인일 때만 저장된 화면 사용.
 *  - /assets/* (파일명에 해시가 붙은 JS/CSS): 캐시 우선. 내용이 바뀌면 파일명이 바뀌므로 안전.
 *  - /images, /fonts, /icons: 캐시 우선 + 백그라운드 갱신. 캐시는 배포마다 새로 만듭니다.
 *  - 다른 출처(Supabase 좋아요 API 등) 요청과 GET 이외 요청: 전혀 관여하지 않음(캐시하지 않음).
 */
const BUILD_ID = '__PWA_BUILD_ID__';
const PRECACHE_ASSETS = ['__PWA_PRECACHE_ASSETS__'];

const CACHE_PREFIX = 'gihu-nongsa-';
const CACHE_NAME = `${CACHE_PREFIX}${BUILD_ID}`;
const APP_SHELL_URL = '/';

const PRECACHE_URLS = [
  APP_SHELL_URL,
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/favicon-32.png',
  ...PRECACHE_ASSETS,
];

const STATIC_PATH_PREFIXES = ['/images/', '/fonts/', '/icons/'];

const OFFLINE_HTML = `<!doctype html><html lang="ko"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0"><title>기후농사</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fbf6ea;color:#1f5c33;font-family:sans-serif;text-align:center;padding:24px;box-sizing:border-box">
<div><p style="font-size:20px;font-weight:800;margin:0 0 8px">인터넷 연결이 필요해요</p>
<p style="margin:0 0 16px;color:#475569">연결을 확인한 뒤 다시 시도해 주세요.</p>
<button onclick="location.reload()" style="border:0;border-radius:999px;background:#2f7d45;color:#fff;padding:10px 20px;font-size:15px;font-weight:700">다시 시도</button></div>
</body></html>`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      // HTTP 캐시를 거치지 않고 서버에서 직접 받아 최신 파일만 저장
      .then((cache) => cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (STATIC_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    event.respondWith(staleWhileRevalidate(request, event));
  }
  // 그 밖의 요청(sw.js, manifest 등)은 브라우저 기본 동작에 맡깁니다.
});

function isCacheable(response) {
  return response && response.ok && response.type === 'basic';
}

async function networkFirstPage(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    // 모든 경로가 같은 index.html(SPA)이므로 앱 셸 하나로 저장합니다.
    if (isCacheable(response)) cache.put(APP_SHELL_URL, response.clone());
    return response;
  } catch {
    const cached = await cache.match(APP_SHELL_URL);
    return (
      cached ||
      new Response(OFFLINE_HTML, {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    );
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (isCacheable(response)) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (isCacheable(response)) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  const response = await network;
  return response || new Response('', { status: 504, statusText: 'Offline' });
}
