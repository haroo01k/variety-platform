/**
 * 소비자 농산물 취향 테스트의 질문·유형 정의입니다.
 * 채점 로직은 src/lib/consumerScoring.ts에 있습니다.
 *
 * 흐름: 작물 선택 → (잘 모르겠어요면) 작물 찾기 질문 2개 → 그 작물의 품종 나누기 질문 3개
 *
 * 품종 나누기 질문은 같은 작물 5개 품종이 서로 다른 답 조합을 갖도록 짰습니다.
 * 즉 품종마다 "이 답을 모두 고르면 이 품종이 1위"인 조합이 하나씩 있습니다.
 * 선택지의 varieties는 그 답과 맞는 품종 ID이며, 근거는 src/data/varieties.ts의 태그입니다.
 * 질문을 바꿀 때는 scripts/check-consumer-quiz.ts로 모든 품종이 1위가 될 수 있는지 확인하세요.
 */
import type { ConsumerCropId, TasteTypeId } from '../types/consumer';

export interface QuizOption {
  id: string;
  icon: string;
  text: string;
  /** 작물 찾기 질문: 이 답과 맞는 작물 */
  crops?: ConsumerCropId[];
  /** 품종 나누기 질문: 이 답과 맞는 품종 ID */
  varieties?: string[];
  /** 결과 화면 취향 유형 판정에 쓰는 표(동점이면 나중에 고른 답 우선) */
  type?: TasteTypeId;
  /** 결과 화면 취향 키워드 */
  keyword?: string;
  /** 추천 이유 문구(이 답과 맞는 품종에 붙임) */
  reason?: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

/** 첫 질문: 작물 선택 */
export const CROP_PICK_QUESTION: QuizQuestion = {
  id: 'CROP',
  text: '어떤 농산물의 신품종이 궁금하세요?',
  options: [
    { id: 'apple', icon: '🍎', text: '사과' },
    { id: 'peach', icon: '🍑', text: '복숭아' },
    { id: 'potato', icon: '🥔', text: '감자' },
    { id: 'corn', icon: '🌽', text: '옥수수' },
    { id: 'cabbage', icon: '🥬', text: '배추' },
    { id: 'unsure', icon: '🤔', text: '잘 모르겠어요, 추천해 주세요' },
  ],
};

/**
 * 작물 찾기 질문(다른 작물끼리 나누는 기준). 두 답의 crops가 겹치는 작물이 하나로 정해집니다.
 * 간식+아삭=사과, 간식+부드러움=복숭아, 간식+쫀득=옥수수, 요리+아삭=배추, 요리+부드러움=감자, 요리+쫀득=옥수수
 */
export const CROP_FINDER_QUESTIONS: QuizQuestion[] = [
  {
    id: 'F1',
    text: '이번에 사고 싶은 농산물은?',
    options: [
      { id: 'snack', icon: '🍽️', text: '간식으로 바로 먹을 것', crops: ['apple', 'peach', 'corn'] },
      { id: 'cook', icon: '🍳', text: '요리 재료로 쓸 것', crops: ['cabbage', 'potato', 'corn'] },
    ],
  },
  {
    id: 'F2',
    text: '더 좋아하는 식감은?',
    options: [
      { id: 'crisp', icon: '🍏', text: '아삭하고 단단한 식감', crops: ['apple', 'cabbage'] },
      { id: 'soft', icon: '🍑', text: '부드럽거나 포슬포슬한 식감', crops: ['peach', 'potato'] },
      { id: 'chewy', icon: '🌽', text: '쫀득쫀득 씹는 재미', crops: ['corn'] },
    ],
  },
];

/** 작물별 품종 나누기 질문(같은 작물끼리 나누는 기준) */
export const CROP_QUESTIONS: Record<ConsumerCropId, QuizQuestion[]> = {
  apple: [
    {
      id: 'APP-Q1',
      text: '사과 한 입, 어떤 식감이 좋아요?',
      options: [
        { id: 'juicy', icon: '💦', text: '과즙이 팡 터지는 아삭함', varieties: ['APP-01', 'APP-04', 'APP-05'], type: 'refresh', keyword: '#아삭과즙', reason: '아삭한 식감이 취향과 잘 맞아요.' },
        { id: 'firm', icon: '🪨', text: '단단하게 씹히는 식감', varieties: ['APP-02', 'APP-03'], type: 'refresh', keyword: '#단단식감', reason: '단단하게 씹히는 식감이 취향과 잘 맞아요.' },
      ],
    },
    {
      id: 'APP-Q2',
      text: '어떤 사과에 눈이 가요?',
      options: [
        { id: 'special', icon: '🌈', text: '색이 특별하거나 큼직한 사과', varieties: ['APP-01', 'APP-02', 'APP-04'], type: 'explorer', keyword: '#독특한모양', reason: '색이나 크기가 특별해 보는 재미가 있어요.' },
        { id: 'classic', icon: '🍎', text: '반듯하고 빨간 전형적인 사과', varieties: ['APP-03', 'APP-05'], type: 'homey', keyword: '#익숙한맛최고', reason: '익숙하고 반듯한 모양의 사과예요.' },
      ],
    },
    {
      id: 'APP-Q3',
      text: '사과를 어떻게 즐길래요?',
      options: [
        { id: 'fresh', icon: '🥤', text: '그대로·조각내서, 주스나 샐러드로', varieties: ['APP-01', 'APP-03'], type: 'sweet', keyword: '#간편하게', reason: '생으로 간편하게 즐기기 좋아요.' },
        { id: 'cook', icon: '🥧', text: '베이킹·조림 같은 요리로', varieties: ['APP-02', 'APP-04', 'APP-05'], type: 'cook', keyword: '#요리활용왕', reason: '베이킹·조림 같은 요리에 잘 어울려요.' },
      ],
    },
  ],
  peach: [
    {
      id: 'PEA-Q1',
      text: '복숭아는 어떤 식감이 좋아요?',
      options: [
        { id: 'firm', icon: '🍏', text: '단단하고 쫀득한 복숭아', varieties: ['PEA-03'], type: 'refresh', keyword: '#단단식감', reason: '단단하고 쫀득한 식감이 취향과 잘 맞아요.' },
        { id: 'soft', icon: '🍑', text: '부드럽고 촉촉한 복숭아', varieties: ['PEA-01', 'PEA-02', 'PEA-04', 'PEA-05'], type: 'sweet', keyword: '#부드러운식감', reason: '부드럽고 촉촉한 식감이 취향과 잘 맞아요.' },
      ],
    },
    {
      id: 'PEA-Q2',
      text: '어떤 맛이 더 끌려요?',
      options: [
        { id: 'sweet', icon: '🍯', text: '신맛 없이 진하게 달콤한 맛', varieties: ['PEA-01', 'PEA-04', 'PEA-05'], type: 'sweet', keyword: '#달콤포근', reason: '신맛이 적고 달콤한 맛이에요.' },
        { id: 'fresh', icon: '🌸', text: '향긋하고 산뜻한 맛', varieties: ['PEA-02', 'PEA-03'], type: 'refresh', keyword: '#향긋산뜻', reason: '향긋하고 산뜻한 맛이 취향과 잘 맞아요.' },
      ],
    },
    {
      id: 'PEA-Q3',
      text: '복숭아를 어떻게 먹고 싶어요?',
      options: [
        { id: 'skin', icon: '🫧', text: '껍질째 간편하게', varieties: ['PEA-01'], type: 'explorer', keyword: '#껍질째간편', reason: '껍질째 간편하게 먹을 수 있어요.' },
        { id: 'big', icon: '🫙', text: '큼직하게 잘라 나누거나 잼·조림으로', varieties: ['PEA-05'], type: 'cook', keyword: '#큼직한한알', reason: '열매가 큼직하고 손질이 편해요.' },
        { id: 'dessert', icon: '🍨', text: '한입 디저트로 그대로', varieties: ['PEA-02', 'PEA-04'], type: 'homey', keyword: '#디저트한입', reason: '생과 그대로 디저트로 즐기기 좋아요.' },
        { id: 'grill', icon: '🔥', text: '구워 먹거나 샐러드로', varieties: ['PEA-03'], type: 'cook', keyword: '#요리활용왕', reason: '썰어도 모양이 유지돼 굽거나 샐러드로 좋아요.' },
      ],
    },
  ],
  potato: [
    {
      id: 'POT-Q1',
      text: '감자는 어떤 식감이 좋아요?',
      options: [
        { id: 'firm', icon: '🍟', text: '바삭하거나 단단한 감자', varieties: ['POT-01', 'POT-02'], type: 'refresh', keyword: '#바삭단단', reason: '바삭하거나 단단한 식감이 취향과 잘 맞아요.' },
        { id: 'fluffy', icon: '☁️', text: '포슬포슬한 감자', varieties: ['POT-03', 'POT-04', 'POT-05'], type: 'homey', keyword: '#포슬포슬', reason: '포슬포슬한 식감이 취향과 잘 맞아요.' },
      ],
    },
    {
      id: 'POT-Q2',
      text: '감자로 무엇을 만들고 싶어요?',
      options: [
        { id: 'snack', icon: '🥔', text: '튀김·칩 같은 간식', varieties: ['POT-01', 'POT-05'], type: 'explorer', keyword: '#간식으로', reason: '튀김·칩 같은 간식으로 좋아요.' },
        { id: 'side', icon: '🍲', text: '볶음·구이·찜·국 같은 반찬', varieties: ['POT-02', 'POT-03', 'POT-04'], type: 'cook', keyword: '#요리활용왕', reason: '반찬 요리에 잘 어울려요.' },
      ],
    },
    {
      id: 'POT-Q3',
      text: '어떤 감자가 더 끌려요?',
      options: [
        { id: 'special', icon: '🌈', text: '색다르거나 손질이 간편한 감자', varieties: ['POT-04', 'POT-05'], type: 'explorer', keyword: '#신품종탐색', reason: '색다르거나 간편해서 새롭게 즐기기 좋아요.' },
        { id: 'basic', icon: '🏡', text: '익숙한 기본 감자', varieties: ['POT-01', 'POT-02', 'POT-03'], type: 'homey', keyword: '#익숙한맛최고', reason: '익숙하고 편안하게 쓰기 좋은 감자예요.' },
      ],
    },
  ],
  corn: [
    {
      id: 'COR-Q1',
      text: '옥수수는 어떤 식감이 좋아요?',
      options: [
        { id: 'chewy', icon: '🌽', text: '쫀득한 찰옥수수', varieties: ['COR-01', 'COR-02', 'COR-03', 'COR-04'], type: 'homey', keyword: '#쫀득식감', reason: '쫀득한 식감이 취향과 잘 맞아요.' },
        { id: 'soft', icon: '☁️', text: '부드러운 옥수수', varieties: ['COR-05'], type: 'sweet', keyword: '#부드러운식감', reason: '부드러운 식감이 취향과 잘 맞아요.' },
      ],
    },
    {
      id: 'COR-Q2',
      text: '어떤 색 옥수수가 좋아요?',
      options: [
        { id: 'white', icon: '🤍', text: '익숙한 하얀 옥수수', varieties: ['COR-01'], type: 'homey', keyword: '#익숙한맛최고', reason: '익숙한 하얀 찰옥수수예요.' },
        { id: 'black', icon: '🖤', text: '까만 옥수수', varieties: ['COR-02'], type: 'explorer', keyword: '#독특한색', reason: '검은색이라 보는 재미가 있어요.' },
        { id: 'spotted', icon: '🎲', text: '얼룩무늬 옥수수', varieties: ['COR-03', 'COR-04'], type: 'explorer', keyword: '#독특한모양', reason: '얼룩무늬가 독특해 보는 재미가 있어요.' },
        { id: 'yellow', icon: '💛', text: '노란 옥수수', varieties: ['COR-05'], type: 'explorer', keyword: '#독특한색', reason: '노란색이라 보는 재미가 있어요.' },
      ],
    },
    {
      id: 'COR-Q3',
      text: '옥수수를 어떻게 먹을래요?',
      options: [
        { id: 'steam', icon: '♨️', text: '쪄 먹거나 밥에 넣어서', varieties: ['COR-01', 'COR-03'], type: 'homey', keyword: '#간편하게', reason: '쪄 먹기 좋은 옥수수예요.' },
        { id: 'grill', icon: '🔥', text: '구워서', varieties: ['COR-04'], type: 'cook', keyword: '#요리활용왕', reason: '구워 먹기 좋은 옥수수예요.' },
        { id: 'tea', icon: '🍵', text: '차로 우려서', varieties: ['COR-02'], type: 'explorer', keyword: '#색다른활용', reason: '수염차처럼 차로도 즐길 수 있어요.' },
        { id: 'salad', icon: '🥗', text: '샐러드로', varieties: ['COR-05'], type: 'refresh', keyword: '#요리활용왕', reason: '샐러드로 즐기기 좋아요.' },
      ],
    },
  ],
  cabbage: [
    {
      id: 'CAB-Q1',
      text: '배추는 어떤 식감이 좋아요?',
      options: [
        { id: 'crisp', icon: '🥬', text: '아삭아삭한 배추', varieties: ['CAB-01', 'CAB-03', 'CAB-04', 'CAB-05'], type: 'refresh', keyword: '#아삭식감', reason: '아삭한 식감이 취향과 잘 맞아요.' },
        { id: 'soft', icon: '☁️', text: '부드럽고 감칠맛 나는 배추', varieties: ['CAB-02'], type: 'homey', keyword: '#부드러운식감', reason: '부드럽고 감칠맛이 나요.' },
      ],
    },
    {
      id: 'CAB-Q2',
      text: '어떤 크기가 좋아요?',
      options: [
        { id: 'mini', icon: '🤏', text: '작고 일찍 나오는 미니 배추', varieties: ['CAB-05'], type: 'explorer', keyword: '#미니사이즈', reason: '작은 크기라 한 번에 쓰기 좋아요.' },
        { id: 'regular', icon: '🛒', text: '익숙한 크기의 배추', varieties: ['CAB-01', 'CAB-02', 'CAB-03', 'CAB-04'], type: 'homey', keyword: '#익숙한맛최고', reason: '익숙한 크기의 배추예요.' },
      ],
    },
    {
      id: 'CAB-Q3',
      text: '배추를 주로 어떻게 먹어요?',
      options: [
        { id: 'kimchi', icon: '🌶️', text: '김치 담그기', varieties: ['CAB-01'], type: 'cook', keyword: '#김치용', reason: '김치 담그기에 잘 어울려요.' },
        { id: 'fresh', icon: '🥗', text: '바로 무쳐 먹는 겉절이·생채', varieties: ['CAB-03'], type: 'refresh', keyword: '#겉절이', reason: '겉절이·생채로 바로 먹기 좋아요.' },
        { id: 'wrap', icon: '🍲', text: '쌈·국·샐러드', varieties: ['CAB-04', 'CAB-05'], type: 'sweet', keyword: '#쌈채소', reason: '쌈이나 국, 샐러드로 좋아요.' },
        { id: 'pan', icon: '🍳', text: '전·찜 같은 익힌 요리', varieties: ['CAB-02'], type: 'cook', keyword: '#요리활용왕', reason: '전·찜 같은 익힌 요리에 잘 어울려요.' },
      ],
    },
  ],
};

export interface TasteTypeInfo {
  id: TasteTypeId;
  name: string;
  emoji: string;
  /** 결과 화면에 보여줄 유형 한 줄 소개 */
  description: string;
}

/** 결과 화면 라벨로 쓰는 취향 유형. 고른 선택지의 type 표가 가장 많은 유형입니다. */
export const TASTE_TYPES: TasteTypeInfo[] = [
  { id: 'explorer', name: '새로움 탐험가형', emoji: '🧭', description: '처음 보는 맛과 독특한 농산물에 먼저 손이 가는 타입이에요.' },
  { id: 'cook', name: '요리 만능 해결사형', emoji: '🍳', description: '어떤 요리에 쓰면 좋을지부터 떠올리는 실용파예요.' },
  { id: 'refresh', name: '상큼한 기분전환형', emoji: '🍋', description: '상큼하고 산뜻한 맛과 아삭한 식감을 좋아하는 타입이에요.' },
  { id: 'sweet', name: '달콤함 수집가형', emoji: '🍯', description: '달콤하고 부드러운 맛에 마음이 가는 타입이에요.' },
  { id: 'homey', name: '포근한 집밥 애호가형', emoji: '🏡', description: '익숙하고 편안한 맛을 가장 좋아하는 타입이에요.' },
];

export const findTasteType = (id: TasteTypeId) => TASTE_TYPES.find((t) => t.id === id) ?? TASTE_TYPES[0];
