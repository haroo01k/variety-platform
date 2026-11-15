/**
 * 농업인 질문의 화면 표시용 옵션과 품종 매칭 기준입니다. 채점은 src/lib/farmerScoring.ts.
 * 2026-11 문항 재구성 원칙: 하나의 개념은 한 문항에서만 묻습니다.
 * - 조기출하·빠른 결구 → 수확시기 / 고온·가뭄·습해 → 기상위험 / 병·도복 → 병해충
 * - 가공·김장·택배·보관·명절 → 판로·용도 / 맛·식감 → 식미(밭작물)
 * - 과수의 '관리 부담'과 '줄이고 싶은 작업'은 하나로, '유통 조건'은 판로·용도로 합쳤습니다.
 * 원래 질문지: Claude_업로드용_추천질문지_및_점수로직.pdf 2~3쪽.
 */
import type { CropId } from '../types/crop';
import type { HazardKey, VarietyRecord } from '../types/variety';
import type {
  FieldHarvestTimingAnswer,
  OrchardHarvestMonthAnswer,
  RegionAnswer,
  WinterMinAnswer,
} from '../types/farmer';

export const ORCHARD_CROPS: CropId[] = ['peach', 'apple'];
export const isOrchardCrop = (cropId: CropId) => ORCHARD_CROPS.includes(cropId);

/** F1 지역 */
export const REGION_OPTIONS: { value: RegionAnswer; label: string }[] = [
  { value: 'gangwon-yeongdong', label: '강원 영동·동해안' },
  { value: 'gangwon-yeongseo', label: '강원 영서·평야지' },
  { value: 'highland', label: '고랭지' },
  { value: 'central', label: '중부' },
  { value: 'south', label: '남부' },
  { value: 'other', label: '그 외·미정' },
];

/** F2 기상위험 (복수 선택). value 'none'은 "특별히 없음"(다른 선택과 동시 선택 불가) */
export const CLIMATE_RISK_OPTIONS: { value: HazardKey | 'none'; label: string }[] = [
  { value: 'heat', label: '고온·폭염' },
  { value: 'drought', label: '가뭄' },
  { value: 'wet', label: '장마·집중호우' },
  { value: 'none', label: '특별히 없음' },
];

/**
 * 수확 시기 (밭작물: 감자·옥수수·배추). 조기출하·빠른 결구는 이 문항에서만 묻습니다.
 * 옥수수는 5개 품종이 출사 69~72일로 몰려 있고 만생종이 없어 '빨리 수확 / 상관없음' 두 개만 둡니다.
 */
export const FIELD_HARVEST_TIMING_OPTIONS: Record<'potato' | 'corn' | 'cabbage', { value: FieldHarvestTimingAnswer; label: string }[]> = {
  potato: [
    { value: 'early', label: '빨리 수확(조기출하)' },
    { value: 'normal', label: '보통' },
    { value: 'any', label: '상관없음' },
  ],
  corn: [
    { value: 'early', label: '빨리 수확(출사 70일 이내)' },
    { value: 'any', label: '상관없음' },
  ],
  cabbage: [
    { value: 'early', label: '빨리 수확(빠른 결구·조기출하)' },
    { value: 'normal', label: '보통' },
    { value: 'any', label: '상관없음' },
  ],
};

/** F4 수확 시기 (과수: 사과·복숭아) */
export const ORCHARD_HARVEST_MONTH_OPTIONS: { value: OrchardHarvestMonthAnswer; label: string }[] = [
  { value: '6-7', label: '6~7월' },
  { value: '8', label: '8월' },
  { value: '9', label: '9월' },
  { value: '10', label: '10월' },
];

/** 판로·용도 선택지. matches가 품종 데이터와 맞으면 일치로 봅니다. */
export interface UsageOption {
  value: string;
  label: string;
  matches: (variety: VarietyRecord) => boolean;
}

const hasTag = (tags: string[], wanted: string[]) => tags.some((t) => wanted.includes(t));
const isFirm = (v: VarietyRecord) => v.textureTags.some((t) => t.includes('단단'));

/** 판로·용도 (작물별, 복수 선택). 과수는 기존 '유통 조건'(택배·며칠 보관·명절) 문항을 합쳤습니다. */
export const USAGE_OPTIONS: Record<CropId, UsageOption[]> = {
  potato: [
    { value: 'fresh', label: '식용·직거래', matches: (v) => hasTag(v.usageTags, ['생식']) },
    { value: 'processed', label: '칩·튀김 가공', matches: (v) => hasTag(v.usageTags, ['가공']) },
  ],
  corn: [
    { value: 'snack', label: '간식용 풋옥수수', matches: (v) => hasTag(v.usageTags, ['간식']) },
    { value: 'processed', label: '가공', matches: (v) => hasTag(v.usageTags, ['가공']) },
  ],
  peach: [
    { value: 'fresh', label: '생과 직판', matches: (v) => hasTag(v.usageTags, ['생식']) },
    { value: 'school', label: '급식', matches: (v) => hasTag(v.usageTags, ['급식']) },
    { value: 'online', label: '택배', matches: (v) => hasTag(v.usageTags, ['온라인택배', '택배']) || isFirm(v) },
    { value: 'storage', label: '며칠 보관 후 판매', matches: (v) => isFirm(v) || v.usageText.includes('저장') },
    { value: 'handling', label: '손질 편의', matches: (v) => hasTag(v.usageTags, ['손질편의', '손질']) },
  ],
  apple: [
    { value: 'fresh', label: '생과 직판', matches: (v) => hasTag(v.usageTags, ['생식']) },
    { value: 'school', label: '급식·조각과일', matches: (v) => hasTag(v.usageTags, ['급식']) },
    { value: 'online', label: '택배', matches: (v) => hasTag(v.usageTags, ['온라인택배', '택배']) || isFirm(v) },
    { value: 'storage', label: '며칠 보관 후 판매', matches: (v) => isFirm(v) || v.usageText.includes('저장성') },
    { value: 'holiday', label: '명절 출하', matches: (v) => hasTag(v.usageTags, ['명절']) },
  ],
  cabbage: [
    { value: 'kimjang', label: '김장·범용', matches: (v) => hasTag(v.usageTags, ['김장']) },
    { value: 'fresh', label: '신선채소(쌈·겉절이)', matches: (v) => hasTag(v.activityTags, ['쌈', '겉절이', '생채', '샐러드']) },
    { value: 'small', label: '1~2인용 소형', matches: (v) => hasTag(v.usageTags, ['소형']) },
  ],
};

/** 식미 선택지(밭작물 전용). 전문가 자문: 옥수수·배추·감자는 품질·식미를 고려할 것 */
export interface TasteOption {
  value: string;
  label: string;
  matches?: (variety: VarietyRecord) => boolean;
}

export const TASTE_OPTIONS: Record<'potato' | 'corn' | 'cabbage', TasteOption[]> = {
  potato: [
    { value: 'fluffy', label: '포슬포슬(찐감자)', matches: (v) => hasTag(v.textureTags, ['포슬포슬']) },
    { value: 'firm', label: '단단·바삭(볶음·튀김)', matches: (v) => hasTag(v.textureTags, ['단단', '바삭']) },
    { value: 'any', label: '상관없음' },
  ],
  corn: [
    { value: 'chewy', label: '쫀득한 찰옥수수', matches: (v) => hasTag(v.textureTags, ['쫀득']) },
    // 찰옥수수 식미는 과피(껍질) 두께가 좌우: 흑점2호(강원농기원 육성 자료)·흑점3호(2026 실증) 과피 얇음
    { value: 'thin-skin', label: '껍질이 얇고 연한 찰옥수수', matches: (v) => hasTag(v.textureTags, ['얇은 껍질']) },
    {
      value: 'soft-sweet',
      label: '부드러운 단맛',
      matches: (v) => hasTag(v.textureTags, ['부드러움']) || hasTag(v.tasteTags, ['부드러운맛']),
    },
    { value: 'any', label: '상관없음' },
  ],
  cabbage: [
    { value: 'crisp', label: '아삭한 식감', matches: (v) => hasTag(v.textureTags, ['아삭']) },
    {
      value: 'soft-umami',
      label: '부드럽고 감칠맛',
      matches: (v) => hasTag(v.textureTags, ['부드러움']) || hasTag(v.tasteTags, ['감칠맛']),
    },
    { value: 'sweet', label: '단맛', matches: (v) => hasTag(v.tasteTags, ['단맛']) },
    { value: 'any', label: '상관없음' },
  ],
};

export interface PestOption {
  value: string;
  label: string;
  /** 품종 병해충 기재(pestNote)에서 찾을 키워드. 문장(; 구분) 단위로 저항·주의를 판단합니다. */
  keywords?: string[];
  /** 이 병해충을 고르면 결과 화면에 항상 붙일 안내(품종별 근거가 없는 병해충용) */
  caution?: string;
}

/** 병해충·재배 문제 (작물별, 복수 선택). value 'none'은 "없음" */
export const PEST_OPTIONS: Record<CropId, PestOption[]> = {
  potato: [
    { value: 'blight', label: '역병', keywords: ['역병'] },
    { value: 'scab', label: '더뎅이병', keywords: ['더뎅이병'] },
    { value: 'virus', label: '바이러스', keywords: ['바이러스'] },
    { value: 'none', label: '없음' },
  ],
  corn: [
    { value: 'leaf-spot', label: '깨씨무늬병', keywords: ['깨씨무늬병', '호마엽고병'] },
    { value: 'lodging', label: '쓰러짐(도복)', keywords: ['쓰러짐'] },
    { value: 'none', label: '없음' },
  ],
  peach: [
    { value: 'bacterial-spot', label: '세균구멍병', keywords: ['세균구멍병', '세균성구멍병'] },
    { value: 'gray-mold', label: '잿빛무늬병', keywords: ['잿빛무늬병'] },
    { value: 'cracking', label: '열과', keywords: ['열과'] },
    { value: 'none', label: '없음' },
  ],
  apple: [
    { value: 'anthracnose', label: '탄저병', keywords: ['탄저병'] },
    { value: 'ring-rot', label: '겹무늬썩음병', keywords: ['겹무늬썩음병'] },
    { value: 'brown-spot', label: '갈색무늬병', keywords: ['갈색무늬병'] },
    { value: 'cracking', label: '열과', keywords: ['열과'] },
    { value: 'none', label: '없음' },
  ],
  // 배추: 품종별 근거는 원교20054호(충해·무름병 발생 비율 낮음)뿐이라,
  // 근거가 없는 병해충은 점수 대신 결과 화면 안내(caution)로 처리합니다. (농사로 배추 주요 병해충 방제)
  cabbage: [
    {
      value: 'soft-rot',
      label: '무름병',
      keywords: ['무름병'],
      caution: '무름병은 품종에 따라 발생 정도가 달라요. 여름 고온기·연작 밭에서 특히 주의하세요.',
    },
    { value: 'insects', label: '해충(배추좀나방 등)', keywords: ['충해', '해충'] },
    {
      value: 'clubroot',
      label: '뿌리혹병',
      keywords: ['뿌리혹병'],
      caution: '추천 품종 모두 뿌리혹병 저항성(CR) 자료가 없어요. 발생한 밭이라면 CR 표시 품종을 따로 검토하고, 산성 토양 개량과 돌려짓기를 함께 하세요.',
    },
    {
      value: 'virus',
      label: '바이러스병',
      keywords: ['바이러스'],
      caution: '바이러스병은 약으로 방제할 수 없어 저항성 품종이 최선이에요. 추천 품종은 저항성 자료가 없으니 진딧물 방제를 철저히 하세요.',
    },
    { value: 'none', label: '없음' },
  ],
};

/** FA1 (과수 전용) 최근 5년 겨울 최저기온 */
export const WINTER_MIN_OPTIONS: { value: WinterMinAnswer; label: string }[] = [
  { value: 'below-18', label: '-18℃ 이하' },
  { value: 'between-10-18', label: '-10~-18℃' },
  { value: 'above-10', label: '-10℃ 이상' },
  { value: 'unknown', label: '모름' },
];

/** 줄이고 싶은 작업 (과수 전용, 단일 선택). 기존 '가장 줄이고 싶은 관리 부담' 문항을 합쳤습니다. */
export const ORCHARD_REDUCE_WORK_OPTIONS: { value: string; label: string }[] = [
  { value: 'coloring', label: '착색 관리' },
  { value: 'bagging', label: '봉지 씌우기' },
  { value: 'harvest-spread', label: '수확 작업 분산' },
  { value: 'none', label: '없음' },
];
