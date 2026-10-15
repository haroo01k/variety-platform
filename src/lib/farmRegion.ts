/**
 * 농업인 재배지역 선택값(지도 시·군 + 재배환경)을 기존 추천 로직의 F1 지역 값으로 변환합니다.
 *
 * isHighland
 * - true: 고랭지 재배환경으로 확인 → 'highland'
 * - false: 일반 재배환경으로 확인 → 시·군의 지역 그룹(영동·영서)
 * - null: 재배환경 미확인 → 고랭지 조건을 자동 적용하지 않고 시·군의 지역 그룹 사용
 */
import type { RegionAnswer } from '../types/farmer';
import type { GangwonRegion } from '../data/gangwonRegions';

export interface FarmRegionSelection {
  /** 지도에서 고른 시·군 (강원도 밖이면 null) */
  gangwonRegion: GangwonRegion | null;
  /** 기본 지역 그룹(영동·영서, 또는 강원도 밖 중부·남부·그 외). 태백시 일반 재배지는 사용자가 고름 */
  regionGroup: RegionAnswer | null;
  isHighland: boolean | null;
}

export function resolveRegionAnswer({ regionGroup, isHighland }: FarmRegionSelection): RegionAnswer | null {
  if (isHighland === true) return 'highland';
  return regionGroup;
}

/** 다음 질문으로 넘어갈 수 있는지: 고랭지 확인 지역은 재배환경을 반드시 골라야 합니다. */
export function isRegionSelectionComplete(selection: FarmRegionSelection): boolean {
  if (selection.gangwonRegion?.highlandCheck && selection.isHighland === null) return false;
  return resolveRegionAnswer(selection) !== null;
}
