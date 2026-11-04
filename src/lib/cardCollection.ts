/**
 * 소비자 포토카드 보관함. 북마크로 수집한 품종 ID를 이 기기(localStorage)에 저장합니다.
 * 로그인이 없으므로 기기·브라우저별로 따로 관리되며, 같은 품종은 한 번만 담깁니다.
 * 다시 테스트해도 지우지 않습니다.
 */
const COLLECTION_KEY = 'climate-farming:card-collection';

export function getCollectedCards(): string[] {
  try {
    const raw = localStorage.getItem(COLLECTION_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isCardCollected(varietyId: string): boolean {
  return getCollectedCards().includes(varietyId);
}

/** 보관함에 담기. 'added' 새로 담음, 'exists' 이미 있음, 'failed' 저장소를 쓸 수 없음 */
export function addCardToCollection(varietyId: string): 'added' | 'exists' | 'failed' {
  const cards = getCollectedCards();
  if (cards.includes(varietyId)) return 'exists';
  try {
    localStorage.setItem(COLLECTION_KEY, JSON.stringify([...cards, varietyId]));
    return 'added';
  } catch {
    return 'failed';
  }
}
