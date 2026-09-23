/**
 * ⚠️ 임시(Mock) 데이터입니다.
 * 실제 품종/지역 데이터가 아니며, 화면 레이아웃과 흐름을 확인하기 위한
 * 용도로만 사용합니다. 추후 실제 데이터 연동 시 이 파일을 교체하세요.
 */
import type { Crop } from '../types/crop';

export const CROPS: Crop[] = [
  { id: 'potato', name: '감자', emoji: '🥔', colorClass: 'bg-amber-100', imageSrc: '/images/potato.png' },
  { id: 'corn', name: '옥수수', emoji: '🌽', colorClass: 'bg-yellow-100', imageSrc: '/images/corn.png' },
  { id: 'peach', name: '복숭아', emoji: '🍑', colorClass: 'bg-pink-100', imageSrc: '/images/peach.png' },
  { id: 'apple', name: '사과', emoji: '🍎', colorClass: 'bg-red-100', imageSrc: '/images/apple.png' },
  { id: 'cabbage', name: '배추', emoji: '🥬', colorClass: 'bg-green-100', imageSrc: '/images/cabbage.png' },
];
