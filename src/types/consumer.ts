import type { CropId } from './crop';

export interface ConsumerVariety {
  id: string;
  cropId: CropId;
  /** 품종 캐릭터 placeholder 이모지 */
  emoji: string;
  colorClass: string;
  /** 품종명 */
  varietyName: string;
  /** 취향 유형명 (예: 포슬포슬 홈쿡형) */
  tasteType: string;
  /** 맛 · 식감 · 향 설명 */
  tasteDescription: string;
  /** 활용 요리 목록 */
  dishes: string[];
}
