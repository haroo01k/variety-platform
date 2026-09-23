/**
 * 앱 전체에서 사용하는 라우트 경로 상수.
 * 화면(페이지) 추가/변경 시 이 파일만 수정하면 됩니다.
 */
export const ROUTES = {
  home: '/',
  farmerConditions: '/farmer',
  farmerAnalyzing: '/farmer/analyzing',
  farmerResult: '/farmer/result',
  /** 소비자 단계형 질문 화면. 작물 선택도 이 안에서 첫 단계로 처리합니다. */
  consumer: '/consumer',
  consumerResult: '/consumer/result',
  /** 좋아요 집계 조회 전용 관리자 화면. 로그인 체계는 아직 없습니다(4단계 예정). */
  admin: '/admin',
  about: '/about',
  market: '/market',
} as const;
