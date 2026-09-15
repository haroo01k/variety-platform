import type { CropId } from './crop';

export interface FarmerVarietyScores {
  /** 지역 적합성 */
  regionFit: number;
  /** 기후 대응성 */
  climateResponse: number;
  /** 재배 목적 */
  purposeFit: number;
  /** 병해충 특성 */
  pestResistance: number;
}

export interface FarmerVariety {
  id: string;
  cropId: CropId;
  /** 추천 품종명 */
  name: string;
  emoji: string;
  colorClass: string;
  /** 한 줄 요약 */
  summary: string;
  /** 분석 화면에 보여줄 병해충/기후위험 안내 제목 */
  riskTitle: string;
  /** 분석 화면에 보여줄 병해충/기후위험 안내 설명 */
  riskDescription: string;
  scores: FarmerVarietyScores;
  /** 소비자 관심도 (표시용 텍스트) */
  consumerInterest: string;
}
