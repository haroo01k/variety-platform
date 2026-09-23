import type { CropId } from '../types/crop';

/**
 * 소비자 결과 화면의 2·3순위 "간단 추천 카드"에서 쓰는 작물별 마스코트 이미지.
 * 1순위 상세 카드는 품종별 캐릭터색(PlaceholderImage)을 쓰지만,
 * 2·3순위는 품종별 사진 대신 같은 작물이면 공유하는 마스코트 이미지 하나로 가볍게 보여줍니다.
 */
export const RESULT_EMOJI_IMAGE: Record<CropId, string> = {
  potato: '/images/result-emoji/potato.png',
  corn: '/images/result-emoji/corn.png',
  peach: '/images/result-emoji/peach.png',
  apple: '/images/result-emoji/apple.png',
  cabbage: '/images/result-emoji/cabbage.png',
};
