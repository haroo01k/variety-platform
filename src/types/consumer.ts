import type { VarietyRecord } from './variety';

/** 작물 ID(src/data/crops.ts의 id) */
export type ConsumerCropId = 'potato' | 'corn' | 'peach' | 'apple' | 'cabbage';

/** 첫 화면에서 고르는 작물. 'unsure'면 작물을 정하는 질문 2개를 먼저 묻습니다. */
export type CropPick = ConsumerCropId | 'unsure';

/**
 * 취향 테스트 응답. 질문 ID → 고른 선택지 ID.
 * 첫 작물 선택은 질문 ID 'CROP'에 저장합니다.
 */
export type ConsumerAnswers = Record<string, string>;

export type TasteTypeId = 'explorer' | 'cook' | 'refresh' | 'sweet' | 'homey';

export interface ConsumerRecommendation {
  variety: VarietyRecord;
  /** 답과 맞은 질문 수 / 작물 질문 수(0~1). 화면에는 숫자로 보여주지 않습니다. */
  totalScore: number;
  /** 화면에 보여줄 추천 이유 한 줄(답한 선택지와 기존 품종 태그로 만듭니다) */
  reasons: string[];
}

export interface ConsumerResult {
  /** 추천 대상 작물(직접 골랐거나 작물 찾기 질문으로 정해짐) */
  cropId: ConsumerCropId;
  typeId: TasteTypeId;
  /** 고른 선택지에서 나온 취향 키워드(최대 3개) */
  keywords: string[];
  /** 같은 작물 5개 품종의 순위 */
  ranked: ConsumerRecommendation[];
  /** 같은 작물 안의 상위 3개 */
  top3: ConsumerRecommendation[];
}
