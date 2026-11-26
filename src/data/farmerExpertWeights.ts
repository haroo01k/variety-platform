/**
 * 전문가 자문으로 받은 작물별 평가항목 가중치(0~5)입니다.
 * 0 = 가중치 계산에서 제외, 1 = 매우 낮음 ~ 5 = 매우 높음 (자문 설문지 기준).
 *
 * 자문 결과가 있는 작물은 농업인 추천 점수를 "항목 점수(0~1) × 가중치"의 가중 평균으로 계산합니다
 * (src/lib/farmerScoring.ts). 자문 결과가 없는 작물(옥수수·배추)은 기존 합산 방식을 그대로 씁니다.
 * 과수류(사과·복숭아)는 같은 자문값을 씁니다(EXPERT_WEIGHT_SOURCE, 연구팀 결정 2026-11-26).
 *
 * 전문가가 늘어나면 해당 작물 배열에 응답을 하나 더 추가하면 됩니다.
 * 가중치는 전문가별 값의 평균이며, 0(제외)도 평균에 그대로 포함합니다.
 */
import type { CropId } from '../types/crop';

/** 자문 설문 1번 평가항목 */
export type ExpertItem = 'region' | 'climate' | 'harvestTiming' | 'usage' | 'pest' | 'taste' | 'reduceWork';

/** 자문 설문 2번 기후위험 세부 요인 */
export type ExpertClimateFactor = 'drought' | 'heat' | 'heavyRain' | 'wet';

export interface ExpertReview {
  /** 응답자 구분용(실명 대신 번호) */
  id: string;
  reviewedAt: string;
  /** 설문에 없던 항목(예: 식미)은 비워 둡니다. 비운 항목은 PROVISIONAL_WEIGHTS를 씁니다. */
  items: Partial<Record<ExpertItem, number>>;
  climate: Record<ExpertClimateFactor, number>;
  /** 자문 의견 원문 요약(점수에는 쓰지 않음, 기록용) */
  notes: string[];
}

export const EXPERT_REVIEWS: Partial<Record<CropId, ExpertReview[]>> = {
  potato: [
    {
      id: 'potato-expert-1',
      reviewedAt: '2026-11-11',
      // 관수여건(4)은 관수 문항 삭제로, 관리부담(3)은 문항 재구성(2026-11)으로 관리부담 문항이 없어져 반영하지 않음
      items: { region: 3, climate: 3, harvestTiming: 4, usage: 1, pest: 4 },
      climate: { drought: 4, heat: 4, heavyRain: 4, wet: 4 },
      notes: [
        '비고: 작물의 시기별 가격 동향',
        '추가 평가항목: 생육 초기 기온 저하로 인한 냉해, 품종별 수량성, 지역별 작형에 따른 품종 선택 요령',
        '유의사항: 수량성은 환경을 고려한 판단 필요(같은 품종이어도 지역별로 수량성이 다름)',
      ],
    },
  ],
  apple: [
    {
      id: 'apple-expert-1',
      reviewedAt: '2026-11-11',
      // 관수여건(2)은 관수 문항 삭제로 반영하지 않음. 관리부담(2)은 과수 '줄이고 싶은 작업' 문항에 적용
      items: { region: 2, climate: 3, harvestTiming: 3, usage: 3, pest: 2, reduceWork: 2 },
      climate: { drought: 2, heat: 3, heavyRain: 3, wet: 2 },
      notes: [
        '평가항목: 내재해성·병해 저항성·과실 저장성·생육적기·결과 특성 등 품종 고유 특성 위주로 단순화, 관리에 따라 달라지는 항목은 최소화',
        '유의사항: 추천 정보는 참고용으로만 활용하라는 안내 문구 추가',
        '문항: 판로 → 생산 목적과 판로, 병해충 → 병해충 또는 생리장해, 관리부담과 줄이고 싶은 작업 중복',
        '상세보기: 권장지역 → 재배적지(전국/남부 제외 전국 등 단순화), 생육기간 → 생육특성, 조만성과 출하(수확) 적기 분리',
        '결과: 다른 품종 목록 비교, 농사로 품종설명·디지털 재배달력 등 공식 자료 링크',
      ],
    },
  ],
};

/**
 * 자문값을 다른 작물에서 빌려 쓰는 작물. 과수류는 사과 자문값을 복숭아에도 그대로 씁니다(연구팀 결정 2026-11-26).
 * 복숭아 전용 자문을 받으면 EXPERT_REVIEWS.peach에 넣고 여기서 지웁니다.
 */
export const EXPERT_WEIGHT_SOURCE: Partial<Record<CropId, CropId>> = {
  peach: 'apple',
};

/**
 * 전문가 자문에 없던 항목의 임시 가중치(연구팀 설정). 추가 자문으로 값을 받으면 EXPERT_REVIEWS에 넣고 여기서 지웁니다.
 * - 감자 식미 2: 같은 전문가가 재배목적(용도)을 1로 낮게 봤고, 감자 식미(분질·점질)는 용도와 밀접해
 *   재배목적보다 조금 높고 다른 항목보다 낮게 둠
 */
export const PROVISIONAL_WEIGHTS: Partial<Record<CropId, Partial<Record<ExpertItem, number>>>> = {
  potato: { taste: 2 },
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
  const reviews = EXPERT_REVIEWS[cropId] ?? EXPERT_REVIEWS[EXPERT_WEIGHT_SOURCE[cropId] ?? cropId];
  if (!reviews || reviews.length === 0) return null;
  const allItems: ExpertItem[] = ['region', 'climate', 'harvestTiming', 'usage', 'pest', 'taste', 'reduceWork'];
  const items = {} as Record<ExpertItem, number>;
  allItems.forEach((key) => {
    const rated = reviews.map((r) => r.items[key]).filter((v): v is number => v !== undefined);
    items[key] = rated.length > 0 ? average(rated) : (PROVISIONAL_WEIGHTS[cropId]?.[key] ?? 0);
  });
  const climate = {} as Record<ExpertClimateFactor, number>;
  (Object.keys(reviews[0].climate) as ExpertClimateFactor[]).forEach((key) => {
    climate[key] = average(reviews.map((r) => r.climate[key]));
  });
  return { items, climate, reviewerCount: reviews.length };
}
