import type { CropId } from './crop';
import type { CropSeason, HazardKey, VarietyRecord } from './variety';

export type RegionAnswer =
  | 'gangwon-yeongdong'
  | 'gangwon-yeongseo'
  | 'highland'
  | 'central'
  | 'south'
  | 'other';

/** 옥수수 수확 시기 선택(빨리 수확 / 상관없음). 감자·배추는 심는 달 + 수확하고 싶은 달로 묻습니다. */
export type FieldHarvestTimingAnswer = 'early' | 'any';

/** 과수(사과·복숭아) 수확 시기 선택 */
export type OrchardHarvestMonthAnswer = '6-7' | '8' | '9' | '10';

/** 과수 전용 FA1: 최근 5년 겨울 최저기온 */
export type WinterMinAnswer = 'below-18' | 'between-10-18' | 'above-10' | 'unknown';

/**
 * 농업인 질문 응답 전체.
 * 원칙: 하나의 개념은 한 문항에서만 묻습니다(2026-11 문항 재구성).
 * - 공통: 지역 · 기상위험 · 수확시기 · 판로·용도 · 병해충
 * - 밭작물(감자·옥수수·배추)만: 식미
 * - 과수(사과·복숭아)만: 겨울 최저기온 · 줄이고 싶은 작업
 */
export interface FarmerAnswers {
  cropId: CropId;
  /** F1 */
  region: RegionAnswer;
  /** F2 (복수 선택) */
  climateRisks: HazardKey[];
  /** 옥수수 수확 시기 */
  harvestTiming: FieldHarvestTimingAnswer;
  /** 감자·배추: 작형(봄·여름·가을·겨울). 그 외 작물은 null */
  cropSeason: CropSeason | null;
  /** 감자·배추: 심는 달(1~12, 감자 파종·배추 정식). 그 외 작물은 null */
  plantMonth: number | null;
  /** 감자·배추: 수확하고 싶은 달(1~12). 상관없음이면 null */
  harvestTargetMonth: number | null;
  /** F4 (과수) */
  harvestMonth: OrchardHarvestMonthAnswer;
  /** 식미(밭작물 전용, 작물별 옵션 value). 상관없음·과수는 'any' */
  taste: string;
  /** 판로·용도 (복수 선택, 작물별 옵션 value). 과수는 기존 '유통 조건' 문항을 합쳤습니다. */
  usages: string[];
  /** F6 (복수 선택, 작물별 옵션 value). '없음'은 'none' */
  pestConcerns: string[];
  /** FA1 (과수 전용) */
  winterMin: WinterMinAnswer;
  /** 줄이고 싶은 작업(과수 전용, 기존 '관리 부담' 문항을 합침). 없음은 'none' */
  reduceWork: string;
}

export interface FarmerScoreBreakdown {
  region: number;
  climate: number;
  harvestTiming: number;
  usage: number;
  pest: number;
  /** 식미 (밭작물만) */
  taste: number;
  /** 줄이고 싶은 작업 (과수만) */
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
