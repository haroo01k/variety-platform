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

/** 카드 이미지(PNG)를 파일로 내려받습니다. 같은 사이트의 정적 파일이라 download 속성으로 저장됩니다. */
export function downloadCardImage(src: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = src;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/** 공유 시트에 바로 넘길 수 있도록 카드 PNG를 미리 File로 받아 둡니다. 실패하면 null. */
export async function loadCardImageFile(src: string, fileName: string): Promise<File | null> {
  try {
    const response = await fetch(src);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new File([blob], fileName, { type: 'image/png' });
  } catch {
    return null;
  }
}

/** 카드 이미지 공유 결과. 'downloaded'는 공유 대신 PNG를 내려받은 경우입니다. */
export type ShareCardResult = 'shared' | 'cancelled' | 'downloaded';

/**
 * 카드 이미지 공유. 이미지 파일 공유를 지원하는 환경(Android Chrome, iOS Safari 등)에서는 PNG 파일을 공유 시트로 보내고,
 * 지원하지 않으면 같은 PNG를 내려받습니다. iOS Safari는 클릭 직후에만 공유를 허용하므로 file은 미리 받아 둔 것을 씁니다.
 */
export async function shareCardImage(
  varietyName: string,
  file: File | null,
  src: string,
  fileName: string,
): Promise<ShareCardResult> {
  if (file && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `${varietyName} 신품종 카드`, text: `내가 발견한 신품종, ${varietyName}!` });
      return 'shared';
    } catch (error) {
      // 사용자가 공유를 취소했으면(AbortError) 그대로 두고, 브라우저가 공유를 막았으면 내려받기로 대신합니다.
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    }
  }
  downloadCardImage(src, fileName);
  return 'downloaded';
}
