import type { CropId } from './crop';

/**
 * 판매처 화면의 품종 카드 1개 정보.
 * image가 아직 품종별로 없으면 crops.ts의 작물 대표 이미지를 재사용해도 됩니다.
 */
export interface MarketVariety {
  crop: CropId;
  varietyName: string;
  image: string;
  /** 실제 판매처 링크. 아직 없으면 '#'로 둡니다. */
  marketUrl: string;
  /**
   * true면 image 자체가 우표 테두리·품종명까지 포함된 완성 디자인입니다.
   * 이 경우 카드는 image를 그대로 보여주고, 별도 테두리/텍스트를 덧그리지 않습니다.
   */
  isFullCard?: boolean;
}
