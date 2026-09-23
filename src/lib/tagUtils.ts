/**
 * 태그/문자열 매칭에 쓰는 작은 헬퍼 모음.
 * 품종 데이터의 태그 필드(세미콜론 구분 배열)와 숙기 구분(단일 문자열)을
 * 사용자의 선택지와 비교하는 로직을 한 곳에 모아둡니다.
 */

/** 배열 태그 중 하나라도 desired 목록에 포함되면 true (완전 일치 기준) */
export function hasAnyTag(tags: string[], desired: string | string[]): boolean {
  const targets = Array.isArray(desired) ? desired : [desired];
  return tags.some((tag) => targets.includes(tag));
}

/**
 * 숙기 구분(예: "중생", "조중생", "중만생")이 desired 카테고리(조생/중생/만생)를
 * 포함하는지 부분 문자열로 비교합니다. "조중생"은 "중생"을, "중만생"은 "만생"을
 * 포함하는 것으로 취급해 인접 숙기까지 완만하게 인정합니다.
 */
export function matchesMaturityStage(stage: string, desired: string): boolean {
  return stage.includes(desired);
}

/** 두 값 사이로 clamp */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** 소수 둘째 자리에서 반올림 (0.5 단위 점수 표시용) */
export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
