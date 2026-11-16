/**
 * 농업인 질문의 화면 표시용 옵션과 품종 매칭 기준입니다. 채점은 src/lib/farmerScoring.ts.
 * 2026-11 문항 재구성 원칙: 하나의 개념은 한 문항에서만 묻습니다.
 * - 조기출하·빠른 결구 → 수확시기 / 고온·가뭄·습해 → 기상위험 / 병·도복 → 병해충
 * - 가공·김장·택배·보관·명절 → 판로·용도 / 맛·식감 → 식미(밭작물)
 * - 과수의 '관리 부담'과 '줄이고 싶은 작업'은 하나로, '유통 조건'은 판로·용도로 합쳤습니다.
 * 원래 질문지: Claude_업로드용_추천질문지_및_점수로직.pdf 2~3쪽.
 */
import type { CropId } from '../types/crop';
import type { CropSeason, HazardKey, VarietyRecord } from '../types/variety';
import type {
  FieldHarvestTimingAnswer,
  OrchardHarvestMonthAnswer,
  PotatoHarvestTiming,
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
 * 옥수수 수확 시기. 5개 품종이 출사 69~72일로 몰려 있고 만생종이 없어 두 개만 둡니다.
 * 날짜 감각용 안내: 4월 파종 시 수확은 출사 후 23~25일(국립식량과학원, 한작지 2012) → 4월 중순 파종이면 7월 하순.
 */
export const CORN_HARVEST_TIMING_OPTIONS: { value: FieldHarvestTimingAnswer; label: string }[] = [
  { value: 'early', label: '네, 빨리 수확하고 싶어요 (조중생)' },
  { value: 'any', label: '상관없어요' },
];
export const CORN_HARVEST_HINT = '참고: 4월 중순에 심으면 보통 7월 하순에 수확해요.';

/** 감자·배추 수확 시기: 작형(봄·여름·가을·겨울) → 심는 달 → 수확하고 싶은 달. 교수 자문(월 단위, 실제 재배 달력) 반영 */
export const MONTH_TIMING_CROPS = ['potato', 'cabbage'] as const;
export type MonthTimingCrop = (typeof MONTH_TIMING_CROPS)[number];
export const isMonthTimingCrop = (cropId: CropId): cropId is MonthTimingCrop =>
  (MONTH_TIMING_CROPS as readonly string[]).includes(cropId);

export interface SeasonCalendar {
  value: CropSeason;
  label: string;
  /** 일반적인 심는 달(감자 파종, 배추 정식) */
  plantMonths: number[];
  /** 일반적인 수확 달 */
  harvestMonths: number[];
  /** 감자 수확 시기 선택지 아래에 보여줄 참고 문구 */
  timingHint?: string;
  /** 이 작형을 고르면 결과 화면에 붙일 안내 */
  caution?: string;
}

/**
 * 작형별 일반 재배 달력(공공 자료 기반, 지역에 따라 앞뒤로 달라질 수 있음).
 * 감자
 * - 봄: 파종 2월 하순~3월 상순, 수확 5월 하순~6월 상순(국립식량과학원 남부작물부, 한작지 2019)·중부는 6~7월(하지감자)
 * - 여름(고랭지): 대관령 파종 4월 19일~5월 19일, 덩이줄기 최대는 파종 후 111~144일(한작지 2012), 강원 6~9월 수확(농촌진흥청 웹진 2023.7)
 * - 가을: 8월 파종, 11월 첫 서리 전 수확(고령지농업연구소, 2021), 휴면 50~70일의 짧은 품종 필요
 * - 겨울(시설): 10~12월 심어 3~5월 출하(농촌진흥청, 2024.12)
 * 배추
 * - 봄: 남부 하우스 4월~5월, 터널 5월~6월 상순, 노지 6월 출하(전남농업기술원), 노지 정식 4월 중순
 * - 여름(고랭지·준고랭지): 준고랭지 7월 말 정식·9월 수확(농촌진흥청 2025~2026), 고랭지 8월 중순~9월 출하
 * - 가을(김장): 아주심기 중부 9월 상순·남부 9월 중순(농촌진흥청), 해남 9월 초 정식 → 10월 말~12월 수확
 * - 겨울(월동): 9월 중순~하순 정식, 12월부터 2월 하순까지 출하(해남·남도 서해안)
 */
export const SEASON_CALENDAR: Record<MonthTimingCrop, SeasonCalendar[]> = {
  // 감자는 작형 자료가 있는 품종이 적어(선풍만 봄) 결과가 실제로 달라지는 1기작·2기작 두 가지로만 묻습니다.
  potato: [
    {
      value: 'spring',
      label: '봄~여름 (1년에 한 번)',
      plantMonths: [2, 3, 4, 5],
      harvestMonths: [5, 6, 7, 8, 9],
      timingHint: '참고: 봄감자는 보통 5~7월, 고랭지 여름감자는 7~9월에 캐요.',
    },
    {
      value: 'autumn',
      label: '가을~겨울 (1년에 두 번 짓는 2기작)',
      plantMonths: [8, 9, 10, 11, 12, 1],
      harvestMonths: [11, 12, 3, 4, 5],
      timingHint: '참고: 가을감자는 보통 11~12월, 겨울 시설감자는 3~5월에 캐요.',
      caution: '가을·겨울 감자는 휴면기간이 짧은 2기작용 품종이 필요해요. 추천 품종은 2기작 적합성 자료가 없으니 씨감자 휴면 상태를 꼭 확인하세요.',
    },
  ],
  cabbage: [
    { value: 'spring', label: '봄배추 (3~4월 정식 → 5~6월 수확)', plantMonths: [3, 4], harvestMonths: [5, 6] },
    { value: 'summer', label: '여름배추 (5~7월 정식 → 7~9월 수확)', plantMonths: [5, 6, 7], harvestMonths: [7, 8, 9] },
    { value: 'autumn', label: '가을·김장배추 (8~9월 정식 → 10~12월 수확)', plantMonths: [8, 9], harvestMonths: [10, 11, 12] },
    {
      value: 'winter',
      label: '겨울·월동배추 (9월 정식 → 12~3월 수확)',
      plantMonths: [9],
      harvestMonths: [12, 1, 2, 3],
      caution: '월동배추는 밭에서 겨울을 나는 내한성이 핵심인데, 추천 품종은 월동 재배 자료가 없어요. 해당 지역 월동 재배 이력이 있는 품종인지 꼭 확인하세요.',
    },
  ],
};

export const findSeason = (cropId: MonthTimingCrop, season: CropSeason | null) =>
  SEASON_CALENDAR[cropId].find((c) => c.value === season) ?? null;

/**
 * 감자 수확 시기 선택지: 일찍·보통·늦게 캐기.
 * 품종별 실측 생육일수가 없어 달 대신 숙기(조생·조중생·중생)로 비교합니다. 달은 작형의 timingHint로만 안내합니다.
 */
export const POTATO_HARVEST_OPTIONS: { value: PotatoHarvestTiming; label: string }[] = [
  { value: 'early', label: '일찍 캐기 · 조생' },
  { value: 'mid', label: '보통 · 조중생' },
  { value: 'late', label: '늦게 캐기 · 중생' },
];

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
    // 택배와 보관 판매는 둘 다 '단단한 과육'을 보므로 한 선택지로 합쳐 같은 특성이 두 번 점수 받지 않게 합니다.
    { value: 'online', label: '택배·보관 후 판매', matches: (v) => hasTag(v.usageTags, ['온라인택배', '택배']) || isFirm(v) || v.usageText.includes('저장') },
    { value: 'handling', label: '손질 편의', matches: (v) => hasTag(v.usageTags, ['손질편의', '손질']) },
  ],
  apple: [
    { value: 'fresh', label: '생과 직판', matches: (v) => hasTag(v.usageTags, ['생식']) },
    { value: 'school', label: '급식·조각과일', matches: (v) => hasTag(v.usageTags, ['급식']) },
    { value: 'online', label: '택배·보관 후 판매', matches: (v) => hasTag(v.usageTags, ['온라인택배', '택배']) || isFirm(v) || v.usageText.includes('저장성') },
    { value: 'holiday', label: '명절 출하', matches: (v) => hasTag(v.usageTags, ['명절']) },
  ],
  cabbage: [
    { value: 'kimjang', label: '김장·범용', matches: (v) => hasTag(v.usageTags, ['김장']) },
    // 품종요약서에 용도가 '신선채소용'으로 적힌 품종(원교20049호)도 포함합니다.
    { value: 'fresh', label: '신선채소(쌈·겉절이)', matches: (v) => hasTag(v.activityTags, ['쌈', '겉절이', '생채', '샐러드']) || v.usageText.includes('신선채소') },
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
    // 농촌진흥청이 꼽는 옥수수 주요 병해충(국립식량과학원, 농촌진흥청 웹진 2020.5 / 도 농업기술원 병해충 발생정보).
    // 품종별 근거가 있는 깨씨무늬병만 점수에 반영하고, 나머지는 결과 화면 안내(caution)로 처리합니다.
    { value: 'leaf-spot', label: '깨씨무늬병', keywords: ['깨씨무늬병', '호마엽고병'] },
    {
      value: 'northern-blight',
      label: '그을음무늬병',
      keywords: ['그을음무늬병'],
      caution: '추천 품종은 그을음무늬병 저항성 자료가 없어요. 서늘하고 습한 해에 많이 생기니 병든 잎은 수확 후 치우고 돌려짓기를 해 주세요.',
    },
    {
      value: 'black-streak',
      label: '검은줄오갈병(바이러스)',
      keywords: ['검은줄오갈병'],
      caution: '검은줄오갈병은 애멸구가 옮기는 바이러스병이라 약으로 치료할 수 없어요. 추천 품종은 저항성 자료가 없으니 보리·밀 밭 근처라면 애멸구 방제와 파종 시기 조절을 함께 검토하세요.',
    },
    {
      value: 'corn-borer',
      label: '조명나방',
      keywords: ['조명나방'],
      caution: '조명나방은 품종보다 방제 시기가 중요해요. 1화기 성충이 가장 많은 6월 상순 무렵부터 7~10일 안에 등록 약제로 방제하세요.',
    },
    {
      value: 'fall-armyworm',
      label: '열대거세미나방',
      keywords: ['열대거세미나방'],
      caution: '열대거세미나방은 해마다 날아드는 외래 해충이라 품종 저항성 자료가 없어요. 잎에 구멍·배설물이 보이면 어린 유충일 때 바로 방제하세요.',
    },
    { value: 'lodging', label: '강풍·호우로 쓰러짐(도복)', keywords: ['쓰러짐'] },
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
  // 전문가 자문(관리에 따라 달라지는 항목 최소화)에 맞춰 '줄이고 싶은 작업' 대신 품종 특성으로 묻습니다. 점수 기준은 같습니다.
  { value: 'coloring', label: '착색이 잘 되는 품종' },
  { value: 'bagging', label: '봉지 없이 키울 수 있는 품종' },
  { value: 'harvest-spread', label: '수확 기간이 길어 작업을 나눌 수 있는 품종' },
  { value: 'none', label: '특별히 없음' },
];

/**
 * 병해충 문항 대신 기상위험 문항에서 함께 묻는 항목(작물별).
 * 옥수수 쓰러짐(도복)은 강풍·호우 피해라 기상위험 화면에 보여주고, 점수는 병해충 근거(pestNote)로 그대로 계산합니다.
 */
export const CLIMATE_STEP_PEST_OPTIONS: Partial<Record<CropId, string[]>> = { corn: ['lodging'] };
