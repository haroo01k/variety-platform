/**
 * 농업인 질문(F1~F7, 과수 전용 FA1~FA3)의 화면 표시용 옵션 목록입니다.
 * 실제 채점 로직은 src/lib/farmerScoring.ts에 있고, 이 파일은 "무엇을 보여줄지"만 담당합니다.
 * 값(value)은 farmerScoring.ts의 매칭 로직과 1:1로 대응하므로 함께 수정해야 합니다.
 * 참고: Claude_업로드용_추천질문지_및_점수로직.pdf 2~3쪽.
 */
import type { CropId } from '../types/crop';
import type { HazardKey } from '../types/variety';
import type {
  FieldHarvestTimingAnswer,
  IrrigationAnswer,
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

/** F3 관수 여건 */
export const IRRIGATION_OPTIONS: { value: IrrigationAnswer; label: string }[] = [
  { value: 'sufficient', label: '충분함' },
  { value: 'limited', label: '제한적임' },
  { value: 'difficult', label: '어려움' },
];

/** F4 수확 시기 (밭작물: 감자·옥수수·배추) */
export const FIELD_HARVEST_TIMING_OPTIONS: { value: FieldHarvestTimingAnswer; label: string }[] = [
  { value: 'early', label: '빠른 수확' },
  { value: 'normal', label: '보통' },
  { value: 'late', label: '늦은 수확' },
];

/** F4 수확 시기 (과수: 사과·복숭아) */
export const ORCHARD_HARVEST_MONTH_OPTIONS: { value: OrchardHarvestMonthAnswer; label: string }[] = [
  { value: '6-7', label: '6~7월' },
  { value: '8', label: '8월' },
  { value: '9', label: '9월' },
  { value: '10', label: '10월' },
];

export interface UsageOption {
  value: string;
  label: string;
  /** 용도 태그 매칭 (하나라도 포함되면 일치) */
  tags?: string[];
  /** 태그로 표현되지 않는 경우(예: 감자 조기출하 = 조생종) 숙기로 판단 */
  matchesEarlyStage?: boolean;
}

/** F5 판로와 용도 (작물별, 복수 선택) */
export const USAGE_OPTIONS: Record<CropId, UsageOption[]> = {
  potato: [
    { value: 'fresh', label: '식용·직거래', tags: ['생식'] },
    { value: 'processed', label: '가공', tags: ['가공'] },
    { value: 'early', label: '조기출하', matchesEarlyStage: true },
  ],
  corn: [
    { value: 'snack', label: '간식용 풋옥수수', tags: ['간식'] },
    { value: 'processed', label: '가공', tags: ['가공'] },
    { value: 'direct', label: '직거래', tags: ['생식'] },
  ],
  peach: [
    { value: 'fresh', label: '생과', tags: ['생식'] },
    { value: 'school', label: '급식', tags: ['급식'] },
    { value: 'online', label: '온라인·택배', tags: ['온라인택배', '택배'] },
    { value: 'early', label: '조기출하', tags: ['조기출하'] },
    { value: 'handling', label: '손질 편의', tags: ['손질편의', '손질'] },
  ],
  apple: [
    { value: 'fresh', label: '생과', tags: ['생식'] },
    { value: 'school', label: '급식·조각과일', tags: ['급식'] },
    { value: 'online', label: '온라인·택배', tags: ['온라인택배'] },
    { value: 'holiday', label: '명절', tags: ['명절'] },
    { value: 'processed', label: '가공', tags: ['가공'] },
  ],
  cabbage: [
    { value: 'kimjang', label: '김장·범용', tags: ['김장'] },
    { value: 'fresh', label: '신선채소', tags: ['생식'] },
    { value: 'early-small', label: '조기출하형 소형', tags: ['조기출하'] },
  ],
};

export interface PestOption {
  value: string;
  label: string;
  /** 병해충 텍스트에서 찾을 키워드(하나라도 포함되면 언급된 것으로 판단) */
  keywords?: string[];
}

/** F6 병해충과 관리 (작물별, 복수 선택). value 'none'은 "없음" */
export const PEST_OPTIONS: Record<CropId, PestOption[]> = {
  potato: [
    { value: 'blight', label: '역병', keywords: ['역병'] },
    { value: 'scab', label: '더뎅이병', keywords: ['더뎅이병'] },
    { value: 'virus', label: '바이러스', keywords: ['바이러스'] },
    { value: 'none', label: '없음' },
  ],
  corn: [
    { value: 'leaf-spot', label: '깨씨무늬병·호마엽고병', keywords: ['깨씨무늬병', '호마엽고병'] },
    { value: 'lodging', label: '쓰러짐', keywords: ['쓰러짐'] },
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
  cabbage: [
    { value: 'lacking-data', label: '병해충 저항성 자료가 궁금해요' },
    { value: 'low-mgmt', label: '관리 부담이 낮았으면 해요' },
    { value: 'none', label: '상관없음' },
  ],
};

export interface ManagementOption {
  value: string;
  label: string;
}

/** F7 가장 줄이고 싶은 관리 부담 (작물별, 단일 선택). value 'any'는 "상관없음" */
export const MANAGEMENT_OPTIONS: Record<CropId, ManagementOption[]> = {
  potato: [
    { value: 'early-harvest', label: '조기수확' },
    { value: 'processing', label: '가공 적합' },
    { value: 'pest-mgmt', label: '병해 관리' },
    { value: 'any', label: '상관없음' },
  ],
  corn: [
    { value: 'wet-lodging', label: '습해·도복' },
    { value: 'pest-mgmt', label: '병해' },
    { value: 'processing', label: '가공' },
    { value: 'any', label: '상관없음' },
  ],
  peach: [
    { value: 'bagging', label: '봉지' },
    { value: 'logistics-firm', label: '유통 단단함' },
    { value: 'harvest-spread', label: '수확 분산' },
    { value: 'any', label: '상관없음' },
  ],
  apple: [
    { value: 'coloring', label: '착색' },
    { value: 'storage', label: '저장·유통' },
    { value: 'harvest-spread', label: '수확 분산' },
    { value: 'any', label: '상관없음' },
  ],
  cabbage: [
    { value: 'heat', label: '고온' },
    { value: 'drought', label: '가뭄' },
    { value: 'wet', label: '습해' },
    { value: 'fast-heading', label: '빠른 결구' },
  ],
};

/** FA1 (과수 전용) 최근 5년 겨울 최저기온 */
export const WINTER_MIN_OPTIONS: { value: WinterMinAnswer; label: string }[] = [
  { value: 'below-18', label: '-18℃ 이하' },
  { value: 'between-10-18', label: '-10~-18℃' },
  { value: 'above-10', label: '-10℃ 이상' },
  { value: 'unknown', label: '모름' },
];

/** FA2 (과수 전용) 줄이고 싶은 작업 */
export const ORCHARD_REDUCE_WORK_OPTIONS: { value: string; label: string }[] = [
  { value: 'coloring', label: '착색 관리' },
  { value: 'bagging', label: '봉지 씌우기' },
  { value: 'harvest-spread', label: '수확 작업 분산' },
  { value: 'none', label: '없음' },
];

/** FA3 (과수 전용) 유통에서 중요한 조건 */
export const ORCHARD_LOGISTICS_OPTIONS: { value: string; label: string }[] = [
  { value: 'sell-now', label: '바로 판매' },
  { value: 'few-days', label: '며칠 보관' },
  { value: 'delivery', label: '택배' },
  { value: 'holiday', label: '명절 출하' },
];
