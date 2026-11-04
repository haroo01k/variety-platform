/**
 * 소비자 농산물 취향 테스트 점수 계산 엔진.
 * 1) 8개 A/B 응답 → 7개 취향 속성(0~1, 측정 문항 평균으로 정규화)
 * 2) 유형 적합도 = 유형 핵심 속성의 평균 → 가장 높은 유형(동점이면 TASTE_TYPES 순서)
 * 3) 25개 품종의 속성(기존 맛·식감·활용·새로움 태그에서 산출)과 사용자 속성의 일치도로
 *    서로 다른 작물에서 3개 품종을 추천합니다. 유형과 품종을 1:1로 고정하지 않습니다.
 * 문항·유형 정의: src/data/consumerQuiz.ts
 */
import type {
  ConsumerAnswers,
  ConsumerRecommendation,
  ConsumerResult,
  TasteAttribute,
  TasteProfile,
  TasteTypeId,
} from '../types/consumer';
import type { VarietyRecord } from '../types/variety';
import { VARIETIES } from '../data/varieties';
import { QUIZ_QUESTIONS, TASTE_KEYWORDS, TASTE_TYPES, findTasteType } from '../data/consumerQuiz';
import type { TasteTypeInfo } from '../data/consumerQuiz';

const ATTRIBUTES: TasteAttribute[] = ['novelty', 'texture', 'flavor', 'versatile', 'easy', 'looks', 'explore'];

const round3 = (n: number) => Math.round(n * 1000) / 1000;

/** 응답 → 취향 속성. 각 속성은 그 속성을 측정하는 문항 값의 평균(0~1)입니다. */
export function computeTasteProfile(answers: ConsumerAnswers): TasteProfile {
  const sum = {} as TasteProfile;
  const count = {} as TasteProfile;
  ATTRIBUTES.forEach((a) => {
    sum[a] = 0;
    count[a] = 0;
  });
  QUIZ_QUESTIONS.forEach((question, i) => {
    const choice = answers[i];
    if (!choice) return;
    question[choice].scores.forEach(([attr, value]) => {
      sum[attr] += value;
      count[attr] += 1;
    });
  });
  const profile = {} as TasteProfile;
  ATTRIBUTES.forEach((a) => {
    profile[a] = count[a] > 0 ? sum[a] / count[a] : 0.5;
  });
  return profile;
}

function typeFit(profile: TasteProfile, type: TasteTypeInfo): number {
  const total = type.keys.reduce((acc, [attr, dir]) => acc + (dir === 1 ? profile[attr] : 1 - profile[attr]), 0);
  return round3(total / type.keys.length);
}

/** 적합도가 가장 높은 유형. 동점이면 TASTE_TYPES 배열 순서가 앞선 유형으로 항상 같은 결과를 냅니다. */
function decideTasteType(profile: TasteProfile): { typeId: TasteTypeId; typeFits: Record<TasteTypeId, number> } {
  const typeFits = {} as Record<TasteTypeId, number>;
  let best = TASTE_TYPES[0];
  TASTE_TYPES.forEach((type) => {
    typeFits[type.id] = typeFit(profile, type);
    if (typeFits[type.id] > typeFits[best.id]) best = type;
  });
  return { typeId: best.id, typeFits };
}

/**
 * 0.5에서 가장 먼 속성부터 키워드 3개. 같은 거리면 결과 유형의 핵심 속성, 그다음 ATTRIBUTES 순서.
 * 응답이 반반(0.5)이라 방향이 없는 속성만 남아 3개가 안 되면, 결과 유형 핵심 속성의 방향으로 채웁니다.
 */
function pickKeywords(profile: TasteProfile, type: TasteTypeInfo): string[] {
  const keyAttrs = type.keys.map(([attr]) => attr);
  const picked = ATTRIBUTES.map((attr) => {
    const value = profile[attr];
    const label = value > 0.5 ? TASTE_KEYWORDS[attr].high : value < 0.5 ? TASTE_KEYWORDS[attr].low : '';
    return { attr, label, strength: Math.abs(value - 0.5), isKey: keyAttrs.includes(attr) ? 0 : 1 };
  })
    .filter((k) => k.label)
    .sort((a, b) => b.strength - a.strength || a.isKey - b.isKey || ATTRIBUTES.indexOf(a.attr) - ATTRIBUTES.indexOf(b.attr))
    .slice(0, 3)
    .map((k) => k.label);
  for (const [attr, dir] of type.keys) {
    if (picked.length >= 3) break;
    const label = dir === 1 ? TASTE_KEYWORDS[attr].high : TASTE_KEYWORDS[attr].low;
    if (label && !picked.includes(label) && profile[attr] === 0.5) picked.push(label);
  }
  return picked;
}

const hasAny = (tags: string[], targets: string[]) => tags.some((t) => targets.includes(t));

const CRISP_TEXTURES = ['아삭', '바삭', '단단'];
const SOFT_TEXTURES = ['부드러움', '포슬포슬', '과즙'];
const FRESH_TASTES = ['산뜻', '신선'];
const SWEET_TASTES = ['달콤', '고당도', '저산미', '단맛', '부드러운맛'];
/** 조리에 쓰는 활용 태그가 아닌 것(생으로 먹기·유통·선물 등) */
const NON_COOKING_ACTIVITIES = ['생과', '껍질째', '급식', '택배', '선물', '조각과일', '손질', '가공'];
const EASY_ACTIVITIES = ['생과', '껍질째', '급식', '조각과일', '손질'];
const LOOKS_NOVELTY = ['이색색상', '이색무늬'];

/**
 * 품종 속성(0~1). 기존 품종 데이터의 태그로만 산출하며, 판단할 근거가 없는 속성은 null로 두고 비교에서 뺍니다.
 * (예: 맛 태그가 '담백'·'감칠맛'뿐인 품종은 상큼/달콤 축을 판단하지 않습니다.)
 */
function varietyAttributes(v: VarietyRecord): Record<TasteAttribute, number | null> {
  const crisp = hasAny(v.textureTags, CRISP_TEXTURES);
  const soft = hasAny(v.textureTags, SOFT_TEXTURES);
  const texture = crisp && soft ? 0.5 : crisp ? 1 : soft ? 0 : v.textureTags.includes('쫀득') ? 0.5 : null;

  const fresh = hasAny(v.tasteTags, FRESH_TASTES);
  const sweet = hasAny(v.tasteTags, SWEET_TASTES);
  const flavor = v.tasteTags.includes('새콤달콤') ? 0.6 : fresh && sweet ? 0.5 : fresh ? 1 : sweet ? 0 : null;

  const cookingUses = v.activityTags.filter((t) => !NON_COOKING_ACTIVITIES.includes(t)).length;
  const special = v.noveltyTags.some((t) => t !== '기본') ? 1 : 0;

  return {
    novelty: special,
    explore: special,
    looks: hasAny(v.noveltyTags, LOOKS_NOVELTY) ? 1 : 0,
    texture,
    flavor,
    versatile: Math.min(cookingUses / 2, 1),
    easy: hasAny(v.activityTags, EASY_ACTIVITIES) || v.noveltyTags.includes('간편') ? 1 : 0,
  };
}

const NOVELTY_PHRASE: Record<string, string> = {
  이색색상: '색이 독특해 보는 재미가 있는 품종이에요.',
  이색무늬: '무늬가 독특해 보는 재미가 있는 품종이에요.',
  대과: '열매가 큼직한 품종이에요.',
  소형: '작은 크기라 한 번에 먹기 좋은 품종이에요.',
  조기: '일찍 맛볼 수 있는 품종이에요.',
  간편: '간편하게 즐기기 좋은 품종이에요.',
};

/** EASY_ACTIVITIES 태그별 문구 */
const EASY_PHRASE: Record<string, string> = {
  생과: '생과로 바로 즐기기 좋아요.',
  껍질째: '껍질째 간편하게 먹을 수 있어요.',
  급식: '급식·간식으로 간편하게 즐기기 좋아요.',
  조각과일: '조각과일로 간편하게 즐기기 좋아요.',
  손질: '손질이 편해 간편하게 즐기기 좋아요.',
};

/** 추천 이유 한 줄: 품종 속성 중 사용자와 가장 잘 맞는 핵심 속성을 기존 태그 문구로 설명합니다. */
function buildReason(v: VarietyRecord, attrs: Record<TasteAttribute, number | null>, profile: TasteProfile, type: TasteTypeInfo): string {
  const ordered = [...type.keys.map(([attr]) => attr), ...ATTRIBUTES];
  for (const attr of ordered) {
    const value = attrs[attr];
    if (value === null || 1 - Math.abs(profile[attr] - value) < 0.75) continue;
    if (attr === 'texture' && v.textureTags.length > 0) return `식감(${v.textureTags.join('·')})이 취향과 잘 맞아요.`;
    if (attr === 'flavor' && v.tasteTags.length > 0) return `맛(${v.tasteTags.join('·')})이 취향과 잘 맞아요.`;
    if ((attr === 'novelty' || attr === 'explore' || attr === 'looks') && value === 1) {
      const tag = v.noveltyTags.find((t) => NOVELTY_PHRASE[t]);
      if (tag) return NOVELTY_PHRASE[tag];
    }
    if (attr === 'versatile' && value > 0 && v.recipes.length > 0) return `${v.recipes.slice(0, 2).join(', ')}처럼 다양하게 활용할 수 있어요.`;
    if (attr === 'easy' && value === 1) {
      const use = v.activityTags.find((t) => EASY_PHRASE[t]);
      if (use) return EASY_PHRASE[use];
    }
  }
  return v.tasteSummary;
}

/** 품종 점수: 속성별 (1 - |사용자 - 품종|)의 가중 평균. 결과 유형의 핵심 속성은 가중치 2. */
function scoreVariety(v: VarietyRecord, profile: TasteProfile, type: TasteTypeInfo): ConsumerRecommendation {
  const attrs = varietyAttributes(v);
  const keyAttrs = new Set(type.keys.map(([attr]) => attr));
  let sum = 0;
  let weight = 0;
  ATTRIBUTES.forEach((attr) => {
    const value = attrs[attr];
    if (value === null) return;
    const w = keyAttrs.has(attr) ? 2 : 1;
    sum += w * (1 - Math.abs(profile[attr] - value));
    weight += w;
  });
  return { variety: v, totalScore: round3(weight > 0 ? sum / weight : 0), reasons: [buildReason(v, attrs, profile, type)] };
}

export function getConsumerRecommendation(answers: ConsumerAnswers): ConsumerResult {
  const profile = computeTasteProfile(answers);
  const { typeId, typeFits } = decideTasteType(profile);
  const type = findTasteType(typeId);

  // 동점이면 품종 ID 오름차순으로 항상 같은 순서를 냅니다.
  const ranked = VARIETIES.map((v) => scoreVariety(v, profile, type)).sort(
    (a, b) => b.totalScore - a.totalScore || a.variety.id.localeCompare(b.variety.id),
  );
  // 새로운 품종을 폭넓게 알리기 위해 TOP3는 서로 다른 작물에서 고릅니다.
  const top3: ConsumerRecommendation[] = [];
  for (const r of ranked) {
    if (top3.length === 3) break;
    if (!top3.some((t) => t.variety.cropId === r.variety.cropId)) top3.push(r);
  }

  return { typeId, profile, typeFits, keywords: pickKeywords(profile, type), ranked, top3 };
}
