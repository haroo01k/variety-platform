/**
 * 전문가 자문으로 받은 작물별 평가항목 가중치(0~5)입니다.
 * 0 = 가중치 계산에서 제외, 1 = 매우 낮음 ~ 5 = 매우 높음 (자문 설문지 기준).
 *
 * 자문 결과가 있는 작물은 농업인 추천 점수를 "항목 점수(0~1) × 가중치"의 가중 평균으로 계산합니다
 * (src/lib/farmerScoring.ts). 자문 결과가 없는 작물(사과·복숭아 등)은 기존 합산 방식을 그대로 씁니다.
 *
 * 전문가가 늘어나면 해당 작물 배열에 응답을 하나 더 추가하면 됩니다.
 * 가중치는 전문가별 값의 평균이며, 0(제외)도 평균에 그대로 포함합니다.
 */
import type { CropId } from '../types/crop';

/** 자문 설문 1번 평가항목 */
export type ExpertItem = 'region' | 'climate' | 'irrigation' | 'harvestTiming' | 'usage' | 'pest' | 'management';

/** 자문 설문 2번 기후위험 세부 요인 */
export type ExpertClimateFactor = 'drought' | 'heat' | 'heavyRain' | 'wet';

export interface ExpertReview {
  /** 응답자 구분용(실명 대신 번호) */
  id: string;
  reviewedAt: string;
  items: Record<ExpertItem, number>;
  climate: Record<ExpertClimateFactor, number>;
  /** 자문 의견 원문 요약(점수에는 쓰지 않음, 기록용) */
  notes: string[];
}

export const EXPERT_REVIEWS: Partial<Record<CropId, ExpertReview[]>> = {
  potato: [
    {
      id: 'potato-expert-1',
      reviewedAt: '2026-11-11',
      items: { region: 3, climate: 3, irrigation: 4, harvestTiming: 4, usage: 1, pest: 4, management: 3 },
      climate: { drought: 4, heat: 4, heavyRain: 4, wet: 4 },
      notes: [
        '비고: 작물의 시기별 가격 동향',
        '추가 평가항목: 생육 초기 기온 저하로 인한 냉해, 품종별 수량성, 지역별 작형에 따른 품종 선택 요령',
        '유의사항: 수량성은 환경을 고려한 판단 필요(같은 품종이어도 지역별로 수량성이 다름)',
      ],
    },
  ],
};

/** 자문 의견에서 나온, 결과 화면 주의사항에 덧붙일 안내 문구(작물별) */
export const EXPERT_RESULT_CAUTIONS: Partial<Record<CropId, string[]>> = {
  potato: ['수량성은 같은 품종이라도 지역 환경에 따라 달라질 수 있어요. 우리 지역 재배 사례를 함께 확인해 주세요.'],
};

export interface CropWeights {
  items: Record<ExpertItem, number>;
  climate: Record<ExpertClimateFactor, number>;
  reviewerCount: number;
}

const average = (values: number[]) => (values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0);

/** 작물의 전문가 평균 가중치. 자문 결과가 없으면 null(기존 합산 방식 사용) */
export function getCropWeights(cropId: CropId): CropWeights | null {
  const reviews = EXPERT_REVIEWS[cropId];
  if (!reviews || reviews.length === 0) return null;
  const items = {} as Record<ExpertItem, number>;
  (Object.keys(reviews[0].items) as ExpertItem[]).forEach((key) => {
    items[key] = average(reviews.map((r) => r.items[key]));
  });
  const climate = {} as Record<ExpertClimateFactor, number>;
  (Object.keys(reviews[0].climate) as ExpertClimateFactor[]).forEach((key) => {
    climate[key] = average(reviews.map((r) => r.climate[key]));
  });
  return { items, climate, reviewerCount: reviews.length };
}
