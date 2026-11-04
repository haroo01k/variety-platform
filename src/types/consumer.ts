import type { VarietyRecord } from './variety';

/** 각 문항의 A/B 선택 */
export type QuizChoice = 'A' | 'B';

/** 8개 문항 응답(순서대로). 아직 답하지 않은 문항은 null */
export type ConsumerAnswers = (QuizChoice | null)[];

/**
 * 취향 속성 7가지. 모든 값은 0~1로 정규화합니다.
 * - texture: 1 = 아삭·씹는 재미, 0 = 부드러움
 * - flavor: 1 = 상큼·산뜻, 0 = 달콤·포근
 * - 나머지는 1에 가까울수록 해당 성향이 강함
 */
export type TasteAttribute = 'novelty' | 'texture' | 'flavor' | 'versatile' | 'easy' | 'looks' | 'explore';

export type TasteProfile = Record<TasteAttribute, number>;

export type TasteTypeId = 'explorer' | 'cook' | 'refresh' | 'sweet' | 'homey';

export interface ConsumerRecommendation {
  variety: VarietyRecord;
  /** 사용자 취향과 품종 속성의 일치도(0~1). 화면에는 숫자로 보여주지 않습니다. */
  totalScore: number;
  /** 화면에 보여줄 추천 이유 한 줄(기존 품종 데이터 태그로만 만듭니다) */
  reasons: string[];
}

export interface ConsumerResult {
  typeId: TasteTypeId;
  profile: TasteProfile;
  /** 유형별 적합도(0~1) */
  typeFits: Record<TasteTypeId, number>;
  /** 응답에서 두드러진 취향 키워드 3개 */
  keywords: string[];
  ranked: ConsumerRecommendation[];
  /** 서로 다른 작물에서 고른 상위 3개 */
  top3: ConsumerRecommendation[];
}
