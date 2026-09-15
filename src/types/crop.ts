export type CropId = 'potato' | 'corn' | 'peach' | 'apple' | 'cabbage';

export interface Crop {
  id: CropId;
  /** 작물 이름 (한글) */
  name: string;
  /** placeholder 표시용 이모지 (실제 이미지 준비 전까지 사용) */
  emoji: string;
  /** placeholder 배경에 사용하는 Tailwind 배경색 클래스 */
  colorClass: string;
}
