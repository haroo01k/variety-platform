/**
 * 품종 추천 결과 공유. Web Share API를 지원하는 환경(주로 모바일)에서는 공유 시트를,
 * 지원하지 않는 환경에서는 현재 페이지 링크를 클립보드에 복사합니다.
 */
export async function shareVariety(varietyName: string): Promise<void> {
  const url = window.location.href;
  const shareData: ShareData = {
    title: `${varietyName} 추천 결과`,
    text: `${varietyName} 품종을 확인해보세요.`,
    url,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch {
      // 사용자가 공유를 취소한 경우 등은 조용히 무시합니다.
    }
    return;
  }

  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // 클립보드 접근이 막혀 있으면 조용히 무시합니다.
    }
  }
}
