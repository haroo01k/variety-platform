import type { CropId } from './crop';
import type { VarietyRecord } from './variety';
import type { OrchardHarvestMonthAnswer } from './farmer';

/**
 * C5 새로움 선호. "상관없어요"는 'any', 그 외에는 해당 작물에서 실제로 쓰이는
 * 새로움 태그 값(예: '기본', '이색색상', '이색무늬', '대과', '소형', '간편', '조기')을 그대로 사용합니다.
 */
export type NoveltyPreferenceAnswer = string;

/**
 * 소비자 취향 테스트 응답.
 * harvestMonth·storage는 과수(사과·복숭아)에서만 사용합니다(C6·C7).
 */
export interface ConsumerAnswers {
  cropId: CropId;
  /** C1: 품종의 취향유형 문자열과 그대로 비교 */
  tasteType: string;
  /** C2: 작물별 활용 옵션 value */
  activity: string;
  /** C3: 작물별 맛 옵션 value */
  flavor: string;
  /** C4: 공통 식감 옵션 value(태그와 동일 문자열) */
  texture: string;
  /** C5 */
  novelty: NoveltyPreferenceAnswer;
  /** C6 (과수 전용) */
  harvestMonth: OrchardHarvestMonthAnswer;
  /** C7 (과수 전용) */
  storage: string;
}

export interface ConsumerScoreBreakdown {
  tasteType: number;
  activity: number;
  flavor: number;
  texture: number;
  novelty: number;
  /** C6 + C7 합계 (과수만) */
  orchard: number;
}

export interface ConsumerRecommendation {
  variety: VarietyRecord;
  totalScore: number;
  breakdown: ConsumerScoreBreakdown;
  /** 화면에 보여줄 취향 일치 이유(최대 2개). 점수를 대체하는 표시용 문구입니다. */
  reasons: string[];
}

export interface ConsumerResult {
  ranked: ConsumerRecommendation[];
  top3: ConsumerRecommendation[];
  isCloseCall: boolean;
}
