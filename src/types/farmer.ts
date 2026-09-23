import type { CropId } from './crop';
import type { HazardKey, VarietyRecord } from './variety';

export type RegionAnswer =
  | 'gangwon-yeongdong'
  | 'gangwon-yeongseo'
  | 'highland'
  | 'central'
  | 'south'
  | 'other';

export type IrrigationAnswer = 'sufficient' | 'limited' | 'difficult';

/** 밭작물(감자·옥수수·배추) 수확 시기 선택 */
export type FieldHarvestTimingAnswer = 'early' | 'normal' | 'late';

/** 과수(사과·복숭아) 수확 시기 선택 */
export type OrchardHarvestMonthAnswer = '6-7' | '8' | '9' | '10';

/** 과수 전용 FA1: 최근 5년 겨울 최저기온 */
export type WinterMinAnswer = 'below-18' | 'between-10-18' | 'above-10' | 'unknown';

/**
 * 농업인 질문 응답 전체.
 * F1~F7은 모든 작물 공통, harvestMonth·winterMin·reduceWork·logistics는
 * 과수(사과·복숭아)에서만 사용합니다(FA1~FA3).
 */
export interface FarmerAnswers {
  cropId: CropId;
  /** F1 */
  region: RegionAnswer;
  /** F2 (복수 선택) */
  climateRisks: HazardKey[];
  /** F3 */
  irrigation: IrrigationAnswer;
  /** F4 (밭작물) */
  harvestTiming: FieldHarvestTimingAnswer;
  /** F4 (과수) */
  harvestMonth: OrchardHarvestMonthAnswer;
  /** F5 (복수 선택, 작물별 옵션 value) */
  usages: string[];
  /** F6 (복수 선택, 작물별 옵션 value). '없음'은 'none' */
  pestConcerns: string[];
  /** F7 (단일 선택, 작물별 옵션 value). 상관없음은 'any' */
  managementPriority: string;
  /** FA1 (과수 전용) */
  winterMin: WinterMinAnswer;
  /** FA2 (과수 전용). 없음은 'none' */
  reduceWork: string;
  /** FA3 (과수 전용) */
  logistics: string;
}

export interface FarmerScoreBreakdown {
  region: number;
  climate: number;
  irrigation: number;
  harvestTiming: number;
  usage: number;
  pest: number;
  managementPriority: number;
  /** FA2 + FA3 합계 (과수만) */
  orchard: number;
}

export interface FarmerRecommendation {
  variety: VarietyRecord;
  totalScore: number;
  breakdown: FarmerScoreBreakdown;
  /** 표시 순서대로 최대 2개: 가장 큰 가점 → 두 번째 가점 */
  reasons: string[];
  /** 작물공통 근거, 자료없음, 병해충 주의 등 안내 문구 */
  cautions: string[];
  /** 근거 완결성 등 동률 처리를 위한 값 */
  directEvidenceCount: number;
  regionDirectMatch: boolean;
}

export interface FarmerResult {
  /** 제외되지 않고 채점된 전체 품종(점수 내림차순) */
  ranked: FarmerRecommendation[];
  /** 상위 3개 */
  top3: FarmerRecommendation[];
  /** 1위-2위 점수차가 0.5 이하이면 true */
  isCloseCall: boolean;
  /** 명시적 조건 충돌로 제외된 품종명 목록(예: 겨울 최저기온) */
  excluded: { variety: VarietyRecord; reason: string }[];
}
