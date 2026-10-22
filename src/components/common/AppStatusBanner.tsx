import { useEffect, useState } from 'react';
import { PWA_UPDATED_EVENT } from '../../lib/pwa';

/**
 * 오프라인 상태 / 새 버전 적용 안내 배너.
 * 평소에는 아무것도 그리지 않고, 해당 상황에서만 화면 하단에 작게 떠서 기존 레이아웃에 영향을 주지 않습니다.
 * 좋아요·소비자 관심 TOP3처럼 서버가 필요한 기능은 각 화면에서 이미 실패 시 재시도 안내를 보여줍니다.
 */
export function AppStatusBanner() {
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    const onUpdated = () => setHasUpdate(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    window.addEventListener(PWA_UPDATED_EVENT, onUpdated);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener(PWA_UPDATED_EVENT, onUpdated);
    };
  }, []);

  if (!isOffline && !hasUpdate) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div
        role="status"
        className="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-brand-green-dark px-4 py-3 text-sm text-white shadow-lg"
      >
        {isOffline ? (
          <p>인터넷에 연결되어 있지 않아요. 품종 추천은 볼 수 있지만, 좋아요처럼 서버가 필요한 기능은 연결 후 이용해 주세요.</p>
        ) : (
          <>
            <p>새 버전이 준비됐어요.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="shrink-0 rounded-full bg-brand-yellow px-3 py-1 font-bold text-brand-green-dark"
            >
              새로고침
            </button>
          </>
        )}
      </div>
    </div>
  );
}
