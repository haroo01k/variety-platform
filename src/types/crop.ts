export type CropId = 'potato' | 'corn' | 'peach' | 'apple' | 'cabbage';

export interface Crop {
  id: CropId;
  /** 작물 이름 (한글) */
  name: string;
  /** placeholder 표시용 이모지 (실제 이미지 준비 전까지 사용) */
  emoji: string;
  /** placeholder 배경에 사용하는 Tailwind 배경색 클래스 */
  colorClass: string;
  /**
   * 실제 작물 사진/일러스트 경로. 비워두면 emoji placeholder를 사용합니다.
   * 최종 이미지가 준비되면 이 값만 채우면 CropCard 등에 자동 반영됩니다.
   */
  imageSrc?: string;
}
