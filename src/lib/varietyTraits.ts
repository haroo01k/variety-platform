import type { VarietyRecord } from '../types/variety';

/**
 * 농업인 결과 화면의 '생육특성' 표시용 값.
 * 전문가 자문(사과)에 따라 조만성(조생/중생/만생)과 출하(수확)적기를 따로 보여주고,
 * 과수는 과중·당도를 함께 보여줍니다. 값은 모두 growthPeriodText·maturityStage에서 그대로 뽑아옵니다.
 */
export interface GrowthTraits {
  /** 조생종 / 중생종 / 만생종 등 */
  maturity: string;
  /** 출하(수확)적기. 과수의 '숙기 ...' 값. 없으면 null */
  harvest: string | null;
  /** 과중(과수). 없으면 null */
  fruitWeight: string | null;
  /** 당도(과수). 없으면 null */
  sugar: string | null;
  /** 위 항목에 들어가지 않은 나머지 설명(예: 평균 출사일수 70일). 없으면 null */
  note: string | null;
}

const MATURITY_PREFIX = /^(조생|조중생|중생|중만생|만생)종?/;

export function getGrowthTraits(variety: VarietyRecord): GrowthTraits {
  const stage = variety.maturityStage.trim();
  const maturity = stage ? (stage.endsWith('종') ? stage : `${stage}종`) : '자료 없음';

  let harvest: string | null = null;
  let fruitWeight: string | null = null;
  let sugar: string | null = null;
  const rest: string[] = [];

  // 예) '중생; 숙기 8월 상순~중순; 과중 235~250g, 당도 12.0°Bx 내외'
  //     '조중생종(평균 출사일수 70일)'
  const parts = variety.growthPeriodText
    // ';'로 나누고, 쉼표는 '과중·당도·숙기' 앞에서만 나눕니다(괄호 안 쉼표는 그대로 둠).
    .split(/;|,(?=\s*(?:평균\s*)?(?:과중|당도|숙기))/)
    .map((p) => p.trim())
    .filter(Boolean);

  for (const part of parts) {
    if (part.startsWith('숙기')) {
      harvest = part.replace(/^숙기\s*/, '');
    } else if (/^(평균\s*)?과중/.test(part)) {
      fruitWeight = part.replace(/^(평균\s*)?과중\s*/, '');
    } else if (part.startsWith('당도')) {
      sugar = part.replace(/^당도\s*/, '');
    } else {
      // 맨 앞의 조만성 표기는 maturity로 따로 보여주므로 떼고, 괄호 안 설명만 남깁니다.
      const stripped = part.replace(MATURITY_PREFIX, '').trim().replace(/^\((.*)\)$/, '$1').trim();
      if (stripped) rest.push(stripped);
    }
  }

  return { maturity, harvest, fruitWeight, sugar, note: rest.length > 0 ? rest.join(', ') : null };
}

/**
 * 재배적지 한 줄 요약. 전문가 자문에 따라 '전국', '남부 저지대 제외 전국'처럼 한눈에 보이게 줄입니다.
 * regionSummary가 없는 품종(밭작물 등 원문이 이미 짧은 경우)은 regionText를 그대로 씁니다.
 */
export function getRegionSummary(variety: VarietyRecord): string {
  return variety.regionSummary ?? variety.regionText;
}
