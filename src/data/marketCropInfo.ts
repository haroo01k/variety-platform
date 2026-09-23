import type { CropId } from '../types/crop';

/** 판매처 화면에서 작물별로 보여주는 한 줄 소개. */
export const MARKET_CROP_DESCRIPTIONS: Record<CropId, string> = {
  potato: '튼튼한 한 끼를 담은 감자',
  corn: '달콤한 에너지를 담은 옥수수',
  peach: '달콤한 계절을 전하는 복숭아',
  apple: '아삭한 건강을 담은 사과',
  cabbage: '건강한 식탁을 지키는 배추',
};

/** 판매처 화면 작물별 섹션 배경색(연한 파스텔 톤). */
export const MARKET_SECTION_BG: Record<CropId, string> = {
  potato: '#F6EFE0',
  corn: '#F1F6E1',
  peach: '#FBEAEE',
  apple: '#FCEBE3',
  cabbage: '#E9F3E5',
};

/**
 * 왼쪽 작물 소개 영역을 완성된 디자인 이미지 한 장으로 대체할 때 사용합니다
 * (이미지 안에 캐릭터·작물명·설명이 모두 포함됨). 없는 작물은 기존처럼
 * 대표 이미지 + HTML 텍스트 조합을 그대로 씁니다.
 */
export const MARKET_CROP_INFO_IMAGE: Partial<Record<CropId, string>> = {
  potato: '/images/market/potato-info.png',
  corn: '/images/market/corn-info.png',
  peach: '/images/market/peach-info.png',
  apple: '/images/market/apple-info.png',
  cabbage: '/images/market/cabbage-info.png',
};
