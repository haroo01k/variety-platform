/**
 * 소비자 농산물 취향 테스트(상황 선택형 A/B 8문항)의 문항·유형·키워드 정의입니다.
 * 채점 로직은 src/lib/consumerScoring.ts에 있습니다.
 *
 * 문항별 점수 매핑: 선택지가 측정하는 취향 속성과 그 값(0 또는 1).
 * 한 속성을 여러 문항이 측정하면 속성값은 그 문항들의 평균이 되므로(정규화),
 * 측정 문항 수가 많은 속성이 유형 판정에 과도하게 반영되지 않습니다.
 */
import type { TasteAttribute, TasteTypeId } from '../types/consumer';

export interface QuizOption {
  icon: string;
  text: string;
  scores: [TasteAttribute, number][];
}

export interface QuizQuestion {
  id: string;
  text: string;
  A: QuizOption;
  B: QuizOption;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'Q1',
    text: '처음 보는 신메뉴를 발견했다면?',
    A: { icon: '🤩', text: '새로운 맛이라면 일단 도전!', scores: [['novelty', 1]] },
    B: { icon: '😌', text: '익숙하고 좋아하는 메뉴가 최고!', scores: [['novelty', 0]] },
  },
  {
    id: 'Q2',
    text: '오늘 간식으로 더 끌리는 건?',
    A: { icon: '🍏', text: '한입 베어 물면 아삭아삭!', scores: [['texture', 1]] },
    B: { icon: '🍮', text: '입안에서 부드럽게 녹는 식감!', scores: [['texture', 0]] },
  },
  {
    id: 'Q3',
    text: '친구에게 음식을 대접한다면?',
    A: { icon: '🎉', text: '색다른 요리로 놀라게 해주기', scores: [['novelty', 1], ['versatile', 1]] },
    B: { icon: '🍚', text: '누구나 좋아할 만한 익숙한 음식 준비하기', scores: [['novelty', 0], ['versatile', 0]] },
  },
  {
    id: 'Q4',
    text: '마트에서 더 눈길이 가는 건?',
    A: { icon: '🌈', text: '색깔과 모양이 독특한 농산물', scores: [['looks', 1], ['easy', 0]] },
    B: { icon: '🛒', text: '맛있고 활용하기 편한 농산물', scores: [['looks', 0], ['easy', 1]] },
  },
  {
    id: 'Q5',
    text: '기분 전환이 필요한 오후, 나는?',
    A: { icon: '🍋', text: '상큼하고 산뜻한 맛으로 리프레시!', scores: [['flavor', 1]] },
    B: { icon: '🍯', text: '달콤하고 포근한 맛으로 충전!', scores: [['flavor', 0]] },
  },
  {
    id: 'Q6',
    text: '휴일에 요리를 한다면?',
    A: { icon: '📖', text: '새로운 레시피를 찾아 직접 만들어보기', scores: [['versatile', 1], ['easy', 0]] },
    B: { icon: '⏱️', text: '간단하게 맛있는 음식 완성하기', scores: [['versatile', 0], ['easy', 1]] },
  },
  {
    id: 'Q7',
    text: '둘 중 더 기분 좋은 한입은?',
    A: { icon: '🌽', text: '톡톡 터지고 씹는 재미가 있는 식감', scores: [['texture', 1]] },
    B: { icon: '🍑', text: '촉촉하고 부드러운 식감', scores: [['texture', 0]] },
  },
  {
    id: 'Q8',
    text: '새로운 농산물 하나를 선물받는다면?',
    A: { icon: '🎁', text: '처음 보는 특별한 품종을 경험해 보고 싶어!', scores: [['explore', 1], ['versatile', 0]] },
    B: { icon: '🍳', text: '평소 좋아하는 음식에 활용할 수 있으면 좋겠어!', scores: [['explore', 0], ['versatile', 1]] },
  },
];

export interface TasteTypeInfo {
  id: TasteTypeId;
  name: string;
  emoji: string;
  description: string;
  /**
   * 유형 적합도 = 핵심 속성의 평균. 방향 -1이면 (1 - 속성값)을 씁니다.
   * 품종 추천에서도 이 핵심 속성은 가중치 2로 비교합니다.
   */
  keys: [TasteAttribute, 1 | -1][];
}

/** 배열 순서가 적합도 동점일 때의 우선순위입니다. */
export const TASTE_TYPES: TasteTypeInfo[] = [
  {
    id: 'explorer',
    name: '새로움 탐험가형',
    emoji: '🧭',
    description:
      '처음 보는 맛과 독특한 농산물에 먼저 손이 가는 타입이에요. 색다른 레시피와 새로운 품종을 경험하는 걸 즐겨요. 아직 잘 알려지지 않은 신품종과 특히 잘 어울려요.',
    keys: [['novelty', 1], ['explore', 1], ['looks', 1]],
  },
  {
    id: 'cook',
    name: '요리 만능 해결사형',
    emoji: '🍳',
    description:
      '어떤 요리에 쓰면 좋을지부터 떠올리는 실용파예요. 여러 요리에 두루 활용할 수 있는 농산물을 좋아해요. 직접 레시피를 찾아 만들어 보는 시간도 즐겨요.',
    keys: [['versatile', 1], ['easy', -1]],
  },
  {
    id: 'refresh',
    name: '상큼한 기분전환형',
    emoji: '🍋',
    description:
      '상큼하고 산뜻한 맛으로 기분을 바꾸는 타입이에요. 아삭하고 씹는 재미가 있는 식감을 좋아해요. 한입에 개운해지는 농산물이 잘 어울려요.',
    keys: [['flavor', 1], ['texture', 1]],
  },
  {
    id: 'sweet',
    name: '달콤함 수집가형',
    emoji: '🍯',
    description:
      '달콤하고 부드러운 맛에 마음이 가는 타입이에요. 손질 없이 간식처럼 바로 즐길 수 있는 농산물을 좋아해요. 촉촉하고 단맛이 살아 있는 품종이 잘 어울려요.',
    keys: [['flavor', -1], ['texture', -1], ['easy', 1]],
  },
  {
    id: 'homey',
    name: '포근한 집밥 애호가형',
    emoji: '🏡',
    description:
      '익숙하고 편안한 맛을 가장 좋아하는 타입이에요. 든든하고 부드러운 식감의 음식에서 행복을 느껴요. 매일 밥상에 자연스럽게 어울리는 농산물을 좋아해요.',
    keys: [['novelty', -1], ['texture', -1], ['flavor', -1], ['looks', -1]],
  },
];

/**
 * 취향 키워드. 속성값이 0.5보다 크면 high, 작으면 low 문구를 쓰며,
 * 0.5에서 멀수록 두드러진 취향으로 보고 먼저 고릅니다. 빈 문자열이면 해당 방향 키워드는 쓰지 않습니다.
 */
export const TASTE_KEYWORDS: Record<TasteAttribute, { high: string; low: string }> = {
  novelty: { high: '#새로운맛도전', low: '#익숙한맛최고' },
  texture: { high: '#아삭쫄깃식감', low: '#부드러운식감' },
  flavor: { high: '#상큼산뜻', low: '#달콤포근' },
  versatile: { high: '#요리활용왕', low: '' },
  easy: { high: '#간편하게', low: '#직접요리' },
  looks: { high: '#독특한모양', low: '#맛이우선' },
  explore: { high: '#신품종탐색', low: '' },
};

export const findTasteType = (id: TasteTypeId) => TASTE_TYPES.find((t) => t.id === id) ?? TASTE_TYPES[0];
