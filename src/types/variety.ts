import type { CropId } from './crop';

/** 기후위험 항목. 감자·옥수수·복숭아·사과·배추 통합 데이터의 3개 축입니다. */
export type HazardKey = 'heat' | 'drought' | 'wet';

/** 근거유형. 직접근거 1.0배, 간접근거 0.5배, 작물공통·자료없음은 0배로 반영합니다. */
export type EvidenceType = 'direct' | 'indirect' | 'common';

/**
 * 보완 자료조사에서 받아 score에 임시 반영했지만 근거·출처가 아직 확인되지 않은 등급.
 * 이 값이 있는 항목은 추천 점수에는 들어가되 "근거가 있어요" 추천 이유로는 쓰지 않습니다(src/lib/farmerScoring.ts).
 * 전문가 검토로 근거가 확인되면 reasonText·evidenceType을 고치고 이 값을 지웁니다.
 */
export interface PendingHazardGrade {
  /** 보완자료 원등급(0~3, "n/3" 표기의 n). score에는 기존 0~2점 척도로 맞춰(3→2) 반영 */
  grade: number;
  /** 등급을 가져온 자료 */
  source: string;
  status: '검토 필요';
}

export interface HazardInfo {
  /** 0~2점 원점수 */
  score: number;
  evidenceType: EvidenceType;
  /** 카드에 표시할 근거 원문 */
  reasonText: string;
  /** 근거 확인 전인 보완자료 등급(내부 관리용). 있으면 score·reasonText가 이 등급 기준 */
  pendingReview?: PendingHazardGrade;
}

/**
 * 신품종 추천 서비스의 품종 원본 레코드.
 * "Claude_업로드용_신품종추천_통합데이터" 25개 품종을 그대로 옮긴 것으로,
 * 실제 재배 적합성 확정 판정이 아니라 근거 수준을 함께 공개하는 추천 MVP용 데이터입니다.
 */
export interface VarietyRecord {
  id: string;
  cropId: CropId;
  cropName: string;
  name: string;
  originalName: string;
  regionText: string;
  regionTags: string[];
  hazards: Record<HazardKey, HazardInfo>;
  usageText: string;
  usageTags: string[];
  pestNote: string;
  growthPeriodText: string;
  /** 조생/조중생/중생/중만생/만생 등 */
  maturityStage: string;
  /** 과수(사과·복숭아)만 값이 있음. 없으면 빈 배열 */
  harvestMonths: string[];
  tasteType: string;
  tasteSummary: string;
  tasteTags: string[];
  textureTags: string[];
  recipes: string[];
  activityTags: string[];
  /** 대부분 단일 값이지만 "소형;조기"처럼 복수인 경우도 있어 배열로 관리 */
  noveltyTags: string[];
  characterColorName: string;
  characterColorHex: string;
  farmerSource: string;
  consumerSource: string;
  reviewStatus: string;
  reviewMemo: string;
  /** 겨울철 최저기온 한계(℃). 과수 중 명시적 한계가 있는 품종만(예: 홍슬 -18, 설홍 -19) */
  winterHardinessLimitC?: number | null;
  /** 판매처(쿠팡 검색) 링크. 없으면 "판매처 보기" 버튼을 숨깁니다. */
  marketUrl?: string;
}
