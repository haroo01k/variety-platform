/**
 * PWA(설치형 웹앱) Service Worker 등록.
 * - 프로덕션 빌드에서만 등록합니다. 개발 서버(npm run dev)에서는 캐시 때문에 수정 사항이
 *   안 보이는 일이 없도록 등록하지 않습니다.
 * - 새 버전이 적용되면 `PWA_UPDATED_EVENT`를 window에 알려서 화면에 새로고침 안내를 띄웁니다.
 */
export const PWA_UPDATED_EVENT = 'pwa:updated';

export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  // 이미 이전 버전 Service Worker가 이 화면을 관리 중일 때만 "업데이트"로 봅니다(첫 설치 제외).
  const hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) window.dispatchEvent(new Event(PWA_UPDATED_EVENT));
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // 설치된 앱을 오래 켜두었다가 다시 볼 때도 새 배포가 있는지 확인합니다.
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') registration.update().catch(() => {});
        });
      })
      .catch(() => {
        // 등록에 실패해도 일반 웹사이트로는 그대로 동작합니다.
      });
  });
}
