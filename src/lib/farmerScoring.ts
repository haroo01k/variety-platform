/**
 * 농업인 추천 점수 계산 엔진.
 * - 기본(합산): 최종점수 = 지역 + 기후위험 + 수확시기 + 용도 + 병해충 (+ 밭작물 식미, 과수 줄이고 싶은 작업)
 *   참고: Claude_업로드용_추천질문지_및_점수로직.pdf 2~4쪽.
 * - 전문가 가중치(자문 결과가 있는 작물, 현재 감자): 항목별 점수를 0~1로 맞춘 뒤 전문가 가중치로 가중 평균(0~10점).
 *   해당 질문에 답이 없거나 '상관없음'이면 그 항목은 계산에서 뺍니다. 가중치: src/data/farmerExpertWeights.ts
 */
import type { FarmerAnswers, FarmerRecommendation, FarmerResult, FarmerScoreBreakdown, PotatoHarvestTiming } from '../types/farmer';
import type { EvidenceType, HazardKey, VarietyRecord } from '../types/variety';
import { VARIETIES } from '../data/varieties';
import { PEST_OPTIONS, TASTE_OPTIONS, USAGE_OPTIONS, findSeason, isMonthTimingCrop, isOrchardCrop } from '../data/farmerOptions';
import { clamp, hasAnyTag, round1 } from './tagUtils';
import { EXPERT_RESULT_CAUTIONS, getCropWeights } from '../data/farmerExpertWeights';
import type { CropWeights, ExpertItem } from '../data/farmerExpertWeights';

const REGION_DIRECT_TAGS: Record<FarmerAnswers['region'], string[]> = {
  'gangwon-yeongdong': ['영동', '강원'],
  'gangwon-yeongseo': ['영서', '강원'],
  highland: ['고랭지'],
  central: ['중부'],
  south: ['남부'],
  other: ['미정'],
};

const HAZARD_LABEL: Record<HazardKey, string> = {
  heat: '고온',
  drought: '가뭄',
  wet: '습해',
};

const EVIDENCE_COEFFICIENT: Record<EvidenceType, number> = {
  direct: 1,
  indirect: 0.5,
  common: 0,
};

function climateBaseGain(score: number): number {
  if (score >= 2) return 2;
  if (score === 1) return 1;
  return -2;
}

function scoreRegion(variety: VarietyRecord, answers: FarmerAnswers): { score: number; direct: boolean } {
  const directTags = REGION_DIRECT_TAGS[answers.region];
  if (hasAnyTag(variety.regionTags, directTags)) return { score: 2, direct: true };
  if (variety.regionTags.includes('전국')) return { score: 1, direct: false };
  return { score: 0, direct: false };
}

function scoreClimate(variety: VarietyRecord, risks: HazardKey[]): number {
  const sum = risks.reduce((acc, hazard) => {
    const info = variety.hazards[hazard];
    return acc + climateBaseGain(info.score) * EVIDENCE_COEFFICIENT[info.evidenceType];
  }, 0);
  return clamp(sum, -3, 3);
}

const ORCHARD_MONTHS: Record<FarmerAnswers['harvestMonth'], string[]> = {
  '6-7': ['6', '7'],
  '8': ['8'],
  '9': ['9'],
  '10': ['10'],
};

function scoreHarvestTiming(variety: VarietyRecord, answers: FarmerAnswers): number {
  if (isOrchardCrop(variety.cropId)) {
    const months = ORCHARD_MONTHS[answers.harvestMonth];
    return variety.harvestMonths.some((m) => months.includes(m)) ? 2 : 0;
  }
  if (isMonthTimingCrop(variety.cropId)) return monthTimingScore(variety, answers) ?? 0;
  // 옥수수: 빨리 수확 = 숙기에 '조'가 들어간 품종(조중생, 출사 70일 이내), 상관없음 = 0
  return answers.harvestTiming === 'early' && variety.maturityStage.includes('조') ? 2 : 0;
}

/** 품종 자료에 적힌 작형과 고른 작형이 맞는지. 품종 작형 자료가 없으면 null */
function seasonFits(variety: VarietyRecord, answers: FarmerAnswers): boolean | null {
  if (!answers.cropSeason || !variety.cropSeasons) return null;
  return variety.cropSeasons.seasons.includes(answers.cropSeason);
}

/** 숙기 순서(조생 0 → 만생 4). 감자 '일찍·보통·늦게 캐기'를 숙기로 비교할 때 씁니다. */
const MATURITY_ORDER: Record<string, number> = { 조생: 0, 조중생: 1, 중생: 2, 중만생: 3, 만생: 4 };
const POTATO_TIMING_TARGET: Record<PotatoHarvestTiming, number> = { early: 0, mid: 1, late: 2 };

/**
 * 감자·배추 수확시기 점수(0~2). 품종별 실측 생육일수가 없어 날짜 계산 대신 아래 기준만 씁니다.
 * - 감자 '일찍·보통·늦게 캐기': 조생·조중생·중생과 같으면 2, 한 단계 차이면 1, 그 이상이면 0
 * - 작형: 품종 자료의 권장 작형과 맞으면 +1(감자) 또는 맞으면 2·아니면 0(배추)
 *   감자는 작형 자료가 선풍 하나뿐이라, 자료 없는 품종과 공평하도록 맞을 때만 가점하고 감점하지 않습니다.
 * 판단할 근거가 없으면 null(계산에서 제외)
 */
function monthTimingScore(variety: VarietyRecord, answers: FarmerAnswers): number | null {
  const fit = seasonFits(variety, answers);
  if (variety.cropId === 'potato') {
    const stage = MATURITY_ORDER[variety.maturityStage];
    const timing =
      answers.potatoHarvestTiming && stage !== undefined
        ? Math.max(0, 2 - Math.abs(stage - POTATO_TIMING_TARGET[answers.potatoHarvestTiming]))
        : null;
    if (timing === null) return fit === true ? 2 : null;
    return clamp(timing + (fit === true ? 1 : 0), 0, 2);
  }
  return fit === null ? null : fit ? 2 : 0;
}

function scoreUsage(variety: VarietyRecord, answers: FarmerAnswers): number {
  const options = USAGE_OPTIONS[variety.cropId];
  return answers.usages.reduce((acc, value) => {
    const option = options.find((o) => o.value === value);
    return option && option.matches(variety) ? acc + 2 : acc;
  }, 0);
}

/**
 * 식미(밭작물 전용, 복수 선택): 고른 식미 중 품종 맛·식감 태그와 맞는 비율(0~1).
 * 예) 배추 '아삭' + '단맛'을 골랐는데 순정아삭(아삭·단맛)이면 1, 원교20054호(아삭)면 0.5.
 * 고른 식미가 없으면(상관없음) null.
 */
function tasteMatches(variety: VarietyRecord, answers: FarmerAnswers): number | null {
  if (isOrchardCrop(variety.cropId) || answers.tastes.length === 0) return null;
  const options = TASTE_OPTIONS[variety.cropId as keyof typeof TASTE_OPTIONS] ?? [];
  const chosen = options.filter((o) => o.matches && answers.tastes.includes(o.value));
  if (chosen.length === 0) return null;
  return chosen.filter((o) => o.matches?.(variety)).length / chosen.length;
}

function scoreTaste(variety: VarietyRecord, answers: FarmerAnswers): number {
  return round1(2 * (tasteMatches(variety, answers) ?? 0));
}

/**
 * 병해충 기재(pestNote)를 문장(';' 구분) 단위로 나눠, 키워드가 나온 문장만 보고 판단합니다.
 * 예) "역병 및 더뎅이병 중도저항성; 바이러스 주의" → 더뎅이병은 저항(+2), 바이러스는 주의(-1).
 * (예전에는 문장 전체에 '주의'가 하나라도 있으면 모든 병을 감점해, 장원의 더뎅이병이 부당하게 감점됐습니다.)
 */
function scorePestConcern(pestNote: string, keywords: string[]): number {
  const segments = pestNote.split(/[;；]/).filter((seg) => keywords.some((k) => seg.includes(k)));
  if (segments.length === 0) return 0;
  const positive = segments.some((seg) => /저항성|저항력|강함|우수|강한|강\)|낮음|낮다|적음/.test(seg));
  const negative = segments.some((seg) => /주의|약함|약한|취약|다소 약/.test(seg));
  if (positive && !negative) return 2;
  if (negative) return -1;
  return 0;
}

function scorePest(variety: VarietyRecord, answers: FarmerAnswers): number {
  if (answers.pestConcerns.length === 0 || answers.pestConcerns.includes('none')) return 0;
  const options = PEST_OPTIONS[variety.cropId];
  return answers.pestConcerns.reduce((acc, value) => {
    const option = options.find((o) => o.value === value);
    if (!option || !option.keywords) return acc;
    return acc + scorePestConcern(variety.pestNote, option.keywords);
  }, 0);
}

function scoreOrchardExtras(variety: VarietyRecord, answers: FarmerAnswers): number {
  if (!isOrchardCrop(variety.cropId)) return 0;
  let score = 0;

  // 줄이고 싶은 작업 - 품종의 직접 특성과 일치하면 +2 (판로·유통 조건은 용도 문항으로 합쳐짐)
  switch (answers.reduceWork) {
    case 'coloring':
      if (variety.hazards.heat.reasonText.includes('착색') || variety.usageText.includes('착색')) score += 2;
      break;
    case 'bagging':
      if (variety.pestNote.includes('무봉지')) score += 2;
      break;
    case 'harvest-spread':
      if (variety.harvestMonths.length >= 2) score += 2;
      break;
    default:
      break;
  }

  return score;
}

/** FA1: 겨울 최저기온 한계가 명시된 품종은 사용자가 더 추운 지역을 선택하면 제외 */
function isExcludedByWinterMin(variety: VarietyRecord, answers: FarmerAnswers): string | null {
  if (!isOrchardCrop(variety.cropId)) return null;
  if (answers.winterMin !== 'below-18') return null;
  if (variety.winterHardinessLimitC != null && variety.winterHardinessLimitC >= -18) {
    return `겨울철 최저기온이 ${variety.winterHardinessLimitC}℃ 이하로 내려가면 재배가 어려운 품종이라 제외했어요.`;
  }
  return null;
}

function buildReasons(variety: VarietyRecord, answers: FarmerAnswers, breakdown: FarmerScoreBreakdown): string[] {
  const candidates: { score: number; text: string }[] = [];

  if (breakdown.region > 0) {
    candidates.push({
      score: breakdown.region,
      text:
        breakdown.region >= 2
          ? `${variety.regionText}에 재배 자료가 있어 선택하신 지역 조건과 잘 맞아요.`
          : '전국 재배가 가능한 품종이라 지역 조건과 무난하게 맞아요.',
    });
  }
  answers.climateRisks.forEach((hazard) => {
    const info = variety.hazards[hazard];
    // 근거·출처가 확인되지 않은 보완자료 등급(pendingReview)은 점수에는 반영하되 추천 이유로 내세우지 않습니다.
    if (info.evidenceType !== 'common' && info.score >= 1 && !info.pendingReview) {
      candidates.push({
        score: climateBaseGain(info.score) * EVIDENCE_COEFFICIENT[info.evidenceType],
        text: `${HAZARD_LABEL[hazard]} 관련 ${info.evidenceType === 'direct' ? '직접' : '간접'} 근거가 있어요: ${info.reasonText}`,
      });
    }
  });
  if (breakdown.harvestTiming > 0) {
    candidates.push({
      score: breakdown.harvestTiming,
      text:
        isMonthTimingCrop(variety.cropId) && !(variety.cropId === 'potato' && answers.potatoHarvestTiming)
          ? '고른 작형에 권장되는 품종이에요.'
          : `숙기(${variety.maturityStage})가 원하는 수확 시기와 맞아요.`,
    });
  }
  if (breakdown.usage > 0) {
    candidates.push({ score: breakdown.usage, text: `${variety.usageText} 용도로 활용하기 좋아요.` });
  }
  if (breakdown.pest > 0) {
    candidates.push({ score: breakdown.pest, text: `병해충 관련 강점이 있어요: ${variety.pestNote}` });
  }
  if (breakdown.taste > 0) {
    const texture = [...variety.textureTags, ...variety.tasteTags].join('·');
    candidates.push({ score: breakdown.taste, text: `원하시는 식미와 맞아요(${texture}).` });
  }
  if (breakdown.orchard > 0) {
    candidates.push({ score: breakdown.orchard, text: '줄이고 싶은 작업 부담과 맞는 특성이 있어요.' });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, 2).map((c) => c.text);
}

function buildCautions(variety: VarietyRecord, answers: FarmerAnswers): string[] {
  const cautions: string[] = [];
  answers.climateRisks.forEach((hazard) => {
    const info = variety.hazards[hazard];
    if (info.evidenceType === 'common') {
      cautions.push(
        `${HAZARD_LABEL[hazard]} 근거는 작물공통 자료라 순위에는 반영하지 않았어요. 참고: ${info.reasonText}`,
      );
    }
  });
  if (variety.pestNote && variety.pestNote !== '자료없음') {
    cautions.push(`병해충 참고: ${variety.pestNote}`);
  }
  if (isMonthTimingCrop(variety.cropId)) {
    const season = findSeason(variety.cropId, answers.cropSeason);
    if (season?.caution) cautions.push(season.caution);
    if (seasonFits(variety, answers) === false && variety.cropSeasons) {
      const names = variety.cropSeasons.seasons.map((v) => findSeason(variety.cropId as 'potato' | 'cabbage', v)?.label.split(' (')[0]);
      cautions.push(`이 품종의 권장 작형은 ${names.join('·')}이에요.`);
    }
  }
  // 품종별 근거가 없는 병해충(예: 배추 뿌리혹병·바이러스병)은 점수 대신 안내로 알려줍니다.
  PEST_OPTIONS[variety.cropId]
    .filter((o) => o.caution && answers.pestConcerns.includes(o.value))
    .forEach((o) => cautions.push(o.caution as string));
  cautions.push(...(EXPERT_RESULT_CAUTIONS[variety.cropId] ?? []));
  return cautions;
}

/** 기후위험 한 가지의 점수(0~1). 기존 합산 방식의 가점(-2~+2 × 근거계수)을 0~1로 옮깁니다. */
function hazardUnitScore(variety: VarietyRecord, hazard: HazardKey): number {
  const info = variety.hazards[hazard];
  return (climateBaseGain(info.score) * EVIDENCE_COEFFICIENT[info.evidenceType] + 2) / 4;
}

/**
 * 전문가 가중치 방식의 항목별 점수(0~1). null이면 그 항목은 이번 응답에서 계산에서 뺍니다.
 * breakdown은 기존 합산 방식의 원점수로, 추천 이유 문구와 같은 기준을 쓰기 위해 재사용합니다.
 */
function weightedItemScores(
  variety: VarietyRecord,
  answers: FarmerAnswers,
  breakdown: FarmerScoreBreakdown,
  weights: CropWeights,
): Record<ExpertItem, number | null> {
  // 기후위험: 고른 위험별 점수를 전문가 세부 가중치로 평균(습해는 '집중 호우'·'습해' 가중치의 평균)
  const hazardWeight: Record<HazardKey, number> = {
    heat: weights.climate.heat,
    drought: weights.climate.drought,
    wet: (weights.climate.heavyRain + weights.climate.wet) / 2,
  };
  const climateWeightSum = answers.climateRisks.reduce((acc, h) => acc + hazardWeight[h], 0);
  const climate =
    climateWeightSum > 0
      ? answers.climateRisks.reduce((acc, h) => acc + hazardWeight[h] * hazardUnitScore(variety, h), 0) / climateWeightSum
      : null;

  const usage = answers.usages.length > 0 ? breakdown.usage / (2 * answers.usages.length) : null;

  // 병해충: 우려 항목별로 강점 1 / 언급 없음 1/3 / 주의 0 을 평균
  const pestOptions = PEST_OPTIONS[variety.cropId].filter(
    (o) => o.keywords && answers.pestConcerns.includes(o.value),
  );
  const pest =
    pestOptions.length > 0
      ? pestOptions.reduce((acc, o) => acc + (scorePestConcern(variety.pestNote, o.keywords ?? []) + 1) / 3, 0) /
        pestOptions.length
      : null;

  const taste = tasteMatches(variety, answers);

  return {
    region: breakdown.region / 2,
    climate,
    harvestTiming: isMonthTimingCrop(variety.cropId)
      ? monthTimingScore(variety, answers) === null
        ? null
        : breakdown.harvestTiming / 2
      : answers.harvestTiming === 'any'
        ? null
        : breakdown.harvestTiming / 2,
    usage,
    pest,
    taste,
  };
}

/** 전문가 가중 평균 점수(0~10). 계산에 들어갈 항목이 하나도 없으면 0 */
function weightedTotal(scores: Record<ExpertItem, number | null>, weights: CropWeights): number {
  let sum = 0;
  let weightSum = 0;
  (Object.keys(scores) as ExpertItem[]).forEach((item) => {
    const score = scores[item];
    const weight = weights.items[item];
    if (score === null || weight <= 0) return;
    sum += weight * score;
    weightSum += weight;
  });
  return weightSum > 0 ? (sum / weightSum) * 10 : 0;
}

export function scoreFarmerVariety(variety: VarietyRecord, answers: FarmerAnswers): FarmerRecommendation {
  const region = scoreRegion(variety, answers);
  const breakdown: FarmerScoreBreakdown = {
    region: region.score,
    climate: scoreClimate(variety, answers.climateRisks),
    harvestTiming: scoreHarvestTiming(variety, answers),
    usage: scoreUsage(variety, answers),
    pest: scorePest(variety, answers),
    taste: scoreTaste(variety, answers),
    orchard: scoreOrchardExtras(variety, answers),
  };
  const weights = getCropWeights(variety.cropId);
  const totalScore = weights
    ? round1(weightedTotal(weightedItemScores(variety, answers, breakdown, weights), weights))
    : round1(
        breakdown.region +
          breakdown.climate +
          breakdown.harvestTiming +
          breakdown.usage +
          breakdown.pest +
          breakdown.taste +
          breakdown.orchard,
      );
  const directEvidenceCount = (['heat', 'drought', 'wet'] as HazardKey[]).filter(
    (h) => variety.hazards[h].evidenceType === 'direct',
  ).length;

  return {
    variety,
    totalScore,
    breakdown,
    reasons: buildReasons(variety, answers, breakdown),
    cautions: buildCautions(variety, answers),
    directEvidenceCount,
    regionDirectMatch: region.direct,
  };
}

function compareRecommendations(a: FarmerRecommendation, b: FarmerRecommendation): number {
  if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
  if (b.directEvidenceCount !== a.directEvidenceCount) return b.directEvidenceCount - a.directEvidenceCount;
  if (a.regionDirectMatch !== b.regionDirectMatch) return a.regionDirectMatch ? -1 : 1;
  // 출처 완결성: 두 출처(농업인·소비자)가 모두 채워져 있는지만 비교하고,
  // 그래도 갈리지 않으면 품종ID 오름차순으로 정렬합니다.
  const completenessA = (a.variety.farmerSource ? 1 : 0) + (a.variety.consumerSource ? 1 : 0);
  const completenessB = (b.variety.farmerSource ? 1 : 0) + (b.variety.consumerSource ? 1 : 0);
  if (completenessB !== completenessA) return completenessB - completenessA;
  return a.variety.id.localeCompare(b.variety.id);
}

export function getFarmerRecommendation(answers: FarmerAnswers): FarmerResult {
  const candidates = VARIETIES.filter((v) => v.cropId === answers.cropId);
  const excluded: FarmerResult['excluded'] = [];
  const scoreable: VarietyRecord[] = [];

  candidates.forEach((variety) => {
    const reason = isExcludedByWinterMin(variety, answers);
    if (reason) {
      excluded.push({ variety, reason });
    } else {
      scoreable.push(variety);
    }
  });

  const ranked = scoreable.map((v) => scoreFarmerVariety(v, answers)).sort(compareRecommendations);
  const top3 = ranked.slice(0, 3);
  const isCloseCall = top3.length >= 2 && top3[0].totalScore - top3[1].totalScore <= 0.5;

  return { ranked, top3, isCloseCall, excluded };
}
