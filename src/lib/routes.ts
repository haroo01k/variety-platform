/**
 * 앱 전체에서 사용하는 라우트 경로 상수.
 * 화면(페이지) 추가/변경 시 이 파일만 수정하면 됩니다.
 */
export const ROUTES = {
  home: '/',
  farmerConditions: '/farmer',
  farmerAnalyzing: '/farmer/analyzing',
  farmerResult: '/farmer/result',
  consumerCrops: '/consumer',
  /** react-router용 동적 경로 패턴 */
  consumerRecommendation: '/consumer/:cropId',
} as const;

/** 소비자 추천 카드 화면으로 이동할 때 사용하는 경로 생성 함수 */
export function consumerRecommendationPath(cropId: string): string {
  return `/consumer/${cropId}`;
}
