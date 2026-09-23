/**
 * 소비자 취향 테스트(C1~C5, 과수 전용 C6~C7) 옵션 목록입니다.
 * 채점 로직은 src/lib/consumerScoring.ts에 있습니다.
 * 참고: Claude_업로드용_추천질문지_및_점수로직.pdf 5~6쪽.
 */
import type { CropId } from '../types/crop';
import type { OrchardHarvestMonthAnswer } from '../types/farmer';

/**
 * C1 취향유형 (5개 고정).
 * value는 품종 데이터의 취향유형 문자열과 그대로 비교하는 채점용 값이라 바꾸지 않습니다.
 * label은 화면에 보여줄 이름으로, '건강관리형' 데이터는 화면에서 "균형관리형"으로 표시합니다
 * (질병 예방·건강 개선 효능처럼 읽히지 않도록 캐릭터 이름만 순화 — 점수 로직은 동일).
 */
export const TASTE_TYPE_OPTIONS = [
  { value: '탐험가형', label: '탐험가형', emoji: '🧭', description: '새로운 품종을 먼저 경험해 보고 싶어요' },
  { value: '간편식형', label: '간편식형', emoji: '⚡', description: '쉽고 간편하게 먹을 수 있는 게 좋아요' },
  { value: '미식가형', label: '미식가형', emoji: '🍽️', description: '맛과 식감의 차이를 중요하게 생각해요' },
  { value: '건강관리형', label: '균형관리형', emoji: '⚖️', description: '성분과 균형을 꼼꼼하게 살펴봐요' },
  { value: '홈쿡형', label: '홈쿡형', emoji: '🍳', description: '다양한 요리에 활용하는 걸 좋아해요' },
] as const;

/** 품종 데이터의 취향유형 값(예: '건강관리형')을 화면 표시용 이름(예: '균형관리형')으로 변환 */
export function tasteTypeDisplayLabel(value: string): string {
  return TASTE_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export interface TagOption {
  value: string;
  label: string;
  tags: string[];
}

/** C2 활용 방식 (작물별) — variety.activityTags와 매칭 */
export const ACTIVITY_OPTIONS: Record<CropId, TagOption[]> = {
  potato: [
    { value: 'fried', label: '튀김·칩', tags: ['튀김', '칩'] },
    { value: 'steamed', label: '찜·샐러드', tags: ['찜'] },
    { value: 'stirfry', label: '볶음·구이', tags: ['볶음', '구이'] },
    { value: 'soup', label: '국', tags: ['국'] },
  ],
  corn: [
    { value: 'steamed', label: '찜', tags: ['찜'] },
    { value: 'rice', label: '옥수수밥', tags: ['밥'] },
    { value: 'tea', label: '차', tags: ['차'] },
    { value: 'grilled', label: '버터구이·샐러드', tags: ['구이', '샐러드'] },
  ],
  peach: [
    { value: 'fresh', label: '껍질째·생과', tags: ['생과', '껍질째'] },
    { value: 'snack', label: '급식·간식', tags: ['급식', '간식'] },
    { value: 'delivery', label: '택배', tags: ['택배'] },
    { value: 'handling', label: '손질 활용', tags: ['손질', '손질편의'] },
  ],
  apple: [
    { value: 'fresh', label: '생과', tags: ['생과'] },
    { value: 'drink', label: '샐러드·음료', tags: ['샐러드', '음료'] },
    { value: 'school', label: '급식·조각과일', tags: ['급식', '조각과일'] },
    { value: 'baking', label: '베이킹·조림', tags: ['베이킹', '조림'] },
    { value: 'gift', label: '선물', tags: ['선물'] },
  ],
  cabbage: [
    { value: 'kimchi', label: '김치·겉절이', tags: ['김치'] },
    { value: 'salad', label: '생채·샐러드', tags: ['샐러드'] },
    { value: 'wrap', label: '쌈', tags: ['쌈'] },
    { value: 'pan', label: '전·찜', tags: ['전', '찜'] },
    { value: 'soup', label: '국', tags: ['국'] },
  ],
};

/** C3 맛과 특징 (작물별) — variety.tasteTags와 매칭 */
export const FLAVOR_OPTIONS: Record<CropId, TagOption[]> = {
  potato: [
    { value: 'plain', label: '담백함', tags: ['담백'] },
    { value: 'fluffy', label: '포슬포슬함', tags: ['포슬포슬'] },
    { value: 'unique', label: '색이 독특함', tags: ['독특'] },
  ],
  corn: [
    { value: 'plain', label: '담백함', tags: ['담백'] },
    { value: 'chewy', label: '쫀득함', tags: ['쫀득'] },
    { value: 'soft', label: '부드러움', tags: ['부드러운맛'] },
    { value: 'unique', label: '색이 독특함', tags: ['독특'] },
  ],
  peach: [
    { value: 'sweet', label: '아주 달고 저산미', tags: ['달콤'] },
    { value: 'aroma', label: '향이 진함', tags: ['향'] },
    { value: 'refreshing', label: '산뜻함', tags: ['산뜻'] },
  ],
  apple: [
    { value: 'high-sugar', label: '고당도', tags: ['고당도'] },
    { value: 'sweet-tart', label: '새콤달콤', tags: ['새콤달콤'] },
    { value: 'refreshing', label: '산뜻함', tags: ['산뜻'] },
  ],
  cabbage: [
    { value: 'fresh', label: '아삭하고 신선함', tags: ['신선'] },
    { value: 'mild-sweet', label: '은은한 단맛', tags: ['단맛'] },
    { value: 'soft', label: '부드러움', tags: ['부드러움'] },
  ],
};

/**
 * C5 새로움 선호 (작물별). "새로운 색이나 모양도 괜찮나요?"에 "좋아요"를 고르면
 * 해당 작물에 실제로 존재하는 새로움 태그 중 하나를 더 구체적으로 고르게 하고,
 * "기본"은 익숙한 것을 선호할 때, "상관없음"은 새로움을 점수에 반영하지 않을 때 씁니다.
 */
export const NOVELTY_OPTIONS: Record<CropId, { value: string; label: string }[]> = {
  potato: [
    { value: '기본', label: '익숙한 기본 품종이 좋아요' },
    { value: '간편', label: '간편하게 먹을 수 있으면 좋아요' },
    { value: '이색색상', label: '이색적인 색이 좋아요' },
    { value: 'any', label: '상관없어요' },
  ],
  corn: [
    { value: '기본', label: '익숙한 기본 품종이 좋아요' },
    { value: '이색색상', label: '이색적인 색이 좋아요' },
    { value: '이색무늬', label: '특이한 무늬가 좋아요' },
    { value: 'any', label: '상관없어요' },
  ],
  peach: [
    { value: '기본', label: '익숙한 기본 품종이 좋아요' },
    { value: '이색색상', label: '이색적인 색이 좋아요' },
    { value: '대과', label: '큼직한 게 좋아요' },
    { value: 'any', label: '상관없어요' },
  ],
  apple: [
    { value: '기본', label: '익숙한 기본 품종이 좋아요' },
    { value: '이색색상', label: '이색적인 색이 좋아요' },
    { value: '대과', label: '큼직한 게 좋아요' },
    { value: 'any', label: '상관없어요' },
  ],
  cabbage: [
    { value: '기본', label: '익숙한 기본 품종이 좋아요' },
    { value: '소형', label: '아담한 게 좋아요' },
    { value: 'any', label: '상관없어요' },
  ],
};

/** C4 식감 (공통 5개, variety.textureTags와 매칭) */
export const TEXTURE_OPTIONS: TagOption[] = [
  { value: '아삭', label: '아삭', tags: ['아삭'] },
  { value: '쫀득', label: '쫀득', tags: ['쫀득'] },
  { value: '포슬포슬', label: '포슬포슬', tags: ['포슬포슬'] },
  { value: '부드러움', label: '부드러움', tags: ['부드러움'] },
  { value: '단단', label: '단단함', tags: ['단단'] },
];

/** C6 (과수 전용) 언제 먹고 싶은지 */
export const CONSUMER_HARVEST_MONTH_OPTIONS: { value: OrchardHarvestMonthAnswer; label: string }[] = [
  { value: '6-7', label: '6~7월' },
  { value: '8', label: '8월' },
  { value: '9', label: '9월' },
  { value: '10', label: '10월' },
];

/** C7 (과수 전용) 보관 방법 */
export const CONSUMER_STORAGE_OPTIONS: { value: string; label: string }[] = [
  { value: 'eat-now', label: '바로 먹음' },
  { value: 'few-days', label: '며칠 보관' },
  { value: 'delivery-gift', label: '배송·선물' },
];
