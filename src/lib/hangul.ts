/**
 * 한글 초성 관련 유틸. 지역명 첫 글자 선택·초성 검색에 씁니다.
 * 완성형 한글(가~힣)은 초성 19개 × 중성 21개 × 종성 28개 순서로 배열되어 있어
 * (코드 - 0xAC00) / 588 로 초성 위치를 구할 수 있습니다.
 */
export const HANGUL_INITIALS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const;

const SYLLABLE_START = 0xac00;
const SYLLABLE_END = 0xd7a3;
const SYLLABLES_PER_INITIAL = 21 * 28;

/** 글자 하나의 초성. 완성형 한글이 아니면 글자를 그대로 돌려줍니다. */
export function getInitial(char: string): string {
  const code = char.charCodeAt(0);
  if (code < SYLLABLE_START || code > SYLLABLE_END) return char;
  return HANGUL_INITIALS[Math.floor((code - SYLLABLE_START) / SYLLABLES_PER_INITIAL)];
}

/** 문자열 전체를 초성으로 바꿉니다. 예: '춘천시' → 'ㅊㅊㅅ' */
export function toInitials(text: string): string {
  return Array.from(text, getInitial).join('');
}

/** 입력값이 초성(자음)으로만 이루어졌는지. 예: 'ㅊㅊ' */
export function isInitialsOnly(text: string): boolean {
  return text.length > 0 && Array.from(text).every((char) => (HANGUL_INITIALS as readonly string[]).includes(char));
}
