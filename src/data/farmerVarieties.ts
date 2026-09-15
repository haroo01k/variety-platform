/**
 * ⚠️ 임시(Mock) 데이터입니다.
 * 실제 추천 알고리즘이 아니며, 선택한 작물에 맞춰 화면에 보여줄
 * 고정된 예시 데이터입니다. 추후 실제 추천 로직/데이터로 교체하세요.
 */
import type { FarmerVariety } from '../types/farmer';

export const FARMER_VARIETIES: FarmerVariety[] = [
  {
    id: 'farmer-potato-1',
    cropId: 'potato',
    name: '골든볼 감자',
    emoji: '🥔',
    colorClass: 'bg-amber-100',
    summary: '포슬포슬한 식감으로 다양한 요리에 잘 어울리는 대표 품종입니다.',
    riskTitle: '감자 역병 주의',
    riskDescription: '고온다습한 날씨에는 잎의 갈색 반점을 확인하세요.',
    scores: { regionFit: 3, climateResponse: 3, purposeFit: 2, pestResistance: 2 },
    consumerInterest: '관심 소비자 1,240명',
  },
  {
    id: 'farmer-corn-1',
    cropId: 'corn',
    name: '찰노랑 옥수수',
    emoji: '🌽',
    colorClass: 'bg-yellow-100',
    summary: '당도가 높고 찰기가 좋아 간식용으로 인기가 많은 품종입니다.',
    riskTitle: '옥수수 깨씨무늬병 주의',
    riskDescription: '장마철 습도가 높을 때 잎의 갈색 반점 발생 여부를 확인하세요.',
    scores: { regionFit: 3, climateResponse: 2, purposeFit: 3, pestResistance: 2 },
    consumerInterest: '관심 소비자 980명',
  },
  {
    id: 'farmer-peach-1',
    cropId: 'peach',
    name: '달콤향 복숭아',
    emoji: '🍑',
    colorClass: 'bg-pink-100',
    summary: '과즙이 풍부하고 향이 진한 만생종 복숭아입니다.',
    riskTitle: '복숭아 세균구멍병 주의',
    riskDescription: '봄철 잦은 비에는 잎과 열매의 반점 발생 여부를 확인하세요.',
    scores: { regionFit: 2, climateResponse: 3, purposeFit: 2, pestResistance: 3 },
    consumerInterest: '관심 소비자 1,510명',
  },
  {
    id: 'farmer-apple-1',
    cropId: 'apple',
    name: '아삭레드 사과',
    emoji: '🍎',
    colorClass: 'bg-red-100',
    summary: '아삭한 식감과 균형 잡힌 단맛이 특징인 품종입니다.',
    riskTitle: '사과 탄저병 주의',
    riskDescription: '고온다습한 시기에는 과실 표면의 갈색 반점을 확인하세요.',
    scores: { regionFit: 3, climateResponse: 2, purposeFit: 2, pestResistance: 3 },
    consumerInterest: '관심 소비자 2,050명',
  },
  {
    id: 'farmer-cabbage-1',
    cropId: 'cabbage',
    name: '고랭지 단단배추',
    emoji: '🥬',
    colorClass: 'bg-green-100',
    summary: '속이 꽉 차고 저장성이 좋은 고랭지형 배추입니다.',
    riskTitle: '배추 무름병 주의',
    riskDescription: '집중호우 이후에는 밭의 배수 상태를 확인하세요.',
    scores: { regionFit: 3, climateResponse: 3, purposeFit: 3, pestResistance: 2 },
    consumerInterest: '관심 소비자 760명',
  },
];
