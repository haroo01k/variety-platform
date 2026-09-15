/**
 * ⚠️ 임시(Mock) 데이터입니다.
 * 실제 취향 테스트 로직이 아니며, 선택한 작물에 맞춰 화면에 보여줄
 * 고정된 예시 데이터입니다. 추후 실제 취향 테스트/데이터로 교체하세요.
 */
import type { ConsumerVariety } from '../types/consumer';

export const CONSUMER_VARIETIES: ConsumerVariety[] = [
  {
    id: 'consumer-potato-1',
    cropId: 'potato',
    emoji: '🥔',
    colorClass: 'bg-amber-100',
    varietyName: '골든볼 감자',
    tasteType: '포슬포슬 홈쿡형',
    tasteDescription: '부드럽고 포슬포슬한 식감으로 어떤 요리에도 잘 어울리는 든든한 감자예요.',
    dishes: ['감자조림', '감자튀김', '감자수프'],
  },
  {
    id: 'consumer-corn-1',
    cropId: 'corn',
    emoji: '🌽',
    colorClass: 'bg-yellow-100',
    varietyName: '찰노랑 옥수수',
    tasteType: '달콤 촉촉 간식형',
    tasteDescription: '쫄깃하고 달콤한 맛이 매력적인 간식용 옥수수예요.',
    dishes: ['찐옥수수', '옥수수구이', '콘샐러드'],
  },
  {
    id: 'consumer-peach-1',
    cropId: 'peach',
    emoji: '🍑',
    colorClass: 'bg-pink-100',
    varietyName: '달콤향 복숭아',
    tasteType: '과즙 가득 힐링형',
    tasteDescription: '부드러운 과육과 진한 향으로 여름을 대표하는 복숭아예요.',
    dishes: ['복숭아 화채', '복숭아 샐러드', '생과일 그대로'],
  },
  {
    id: 'consumer-apple-1',
    cropId: 'apple',
    emoji: '🍎',
    colorClass: 'bg-red-100',
    varietyName: '아삭레드 사과',
    tasteType: '새콤아삭 상큼형',
    tasteDescription: '아삭한 식감과 상큼한 단맛의 균형이 좋은 사과예요.',
    dishes: ['사과주스', '사과샐러드', '구운 사과'],
  },
  {
    id: 'consumer-cabbage-1',
    cropId: 'cabbage',
    emoji: '🥬',
    colorClass: 'bg-green-100',
    varietyName: '고랭지 단단배추',
    tasteType: '아삭 건강 담백형',
    tasteDescription: '속이 꽉 차고 아삭한 식감이 살아있는 건강한 배추예요.',
    dishes: ['배추김치', '배추전', '된장국'],
  },
];
