/**
 * 로그인 없이 "이 브라우저"를 구분하기 위한 무작위 익명 ID.
 * 이름/연락처/기기 정보 등 개인정보는 전혀 포함하지 않는 임의 문자열입니다.
 * 브라우저 저장 데이터를 지우면 새 ID가 발급되어 다시 참여할 수 있습니다(허용된 한계).
 */
const DEVICE_ID_KEY = 'climate-farming:device-id';
const LIKED_VARIETIES_KEY = 'climate-farming:liked-varieties';

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `dev-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

/** 이 브라우저의 익명 device_id를 가져오거나 없으면 새로 만들어 저장합니다. */
export function getDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const id = randomId();
    localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  } catch {
    // 프라이빗 모드 등으로 localStorage를 쓸 수 없으면 이번 세션에서만 쓰는 임시 id
    return randomId();
  }
}

/** 이 기기가 좋아요를 누른 품종ID 목록 (하트 표시 상태를 새로고침 후에도 유지하기 위한 로컬 캐시) */
export function getLocalLikedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKED_VARIETIES_KEY);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set<string>();
  }
}

export function setLocalLiked(varietyId: string, liked: boolean): void {
  const set = getLocalLikedSet();
  if (liked) {
    set.add(varietyId);
  } else {
    set.delete(varietyId);
  }
  try {
    localStorage.setItem(LIKED_VARIETIES_KEY, JSON.stringify([...set]));
  } catch {
    // 저장 실패(프라이빗 모드 등)는 조용히 무시 — 이번 세션 내 화면 표시에는 영향 없음
  }
}
