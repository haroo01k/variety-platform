/**
 * 일부 사과·복숭아 품종명은 "아리수(Arisoo)"처럼 뒤에 영문 표기가 병기되어 있습니다.
 * 소비자 결과 2·3순위 간단 카드처럼 한글만 써야 하는 화면에서 이 영문 괄호만 제거할 때 씁니다.
 * 원본 품종 데이터(variety.name)는 그대로 두고, 표시할 때만 이 함수를 거칩니다.
 */
export function toKoreanOnlyName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*$/, '').trim();
}
