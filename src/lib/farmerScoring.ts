/**
 * 농업인 추천 점수 계산 엔진.
 * 최종점수 = 지역 + 기후위험 + 관수 + 수확시기 + 용도 + 병해충 + 관리우선순위 (+ 과수 FA2·FA3)
 * 참고: Claude_업로드용_추천질문지_및_점수로직.pdf 2~4쪽.
 */
import type { FarmerAnswers, FarmerRecommendation, FarmerResult, FarmerScoreBreakdown } from '../types/farmer';
import type { EvidenceType, HazardKey, VarietyRecord } from '../types/variety';
import { VARIETIES } from '../data/varieties';
import { PEST_OPTIONS, USAGE_OPTIONS, isOrchardCrop } from '../data/farmerOptions';
import { clamp, hasAnyTag, matchesMaturityStage, round1 } from './tagUtils';

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

function scoreIrrigation(variety: VarietyRecord, answers: FarmerAnswers): number {
  if (answers.irrigation === 'difficult' && variety.hazards.drought.evidenceType === 'indirect') {
    return -1;
  }
  return 0;
}

const FIELD_STAGE_LABEL: Record<FarmerAnswers['harvestTiming'], string> = {
  early: '조생',
  normal: '중생',
  late: '만생',
};

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
  return matchesMaturityStage(variety.maturityStage, FIELD_STAGE_LABEL[answers.harvestTiming]) ? 2 : 0;
}

function scoreUsage(variety: VarietyRecord, answers: FarmerAnswers): number {
  const options = USAGE_OPTIONS[variety.cropId];
  return answers.usages.reduce((acc, value) => {
    const option = options.find((o) => o.value === value);
    if (!option) return acc;
    if (option.matchesEarlyStage) {
      return acc + (matchesMaturityStage(variety.maturityStage, '조생') ? 2 : 0);
    }
    if (option.tags && hasAnyTag(variety.usageTags, option.tags)) return acc + 2;
    return acc;
  }, 0);
}

function scorePestConcern(pestNote: string, keywords: string[]): number {
  const mentioned = keywords.some((k) => pestNote.includes(k));
  if (!mentioned) return 0;
  const positive = /저항성|저항력|강함|우수|강한|강\)/.test(pestNote);
  const negative = /주의|약함|약한|취약|다소 약/.test(pestNote);
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

function hazardDirectIndirectScore(variety: VarietyRecord, hazard: HazardKey): number {
  const info = variety.hazards[hazard];
  if (info.evidenceType === 'direct') return 2;
  if (info.evidenceType === 'indirect') return 1;
  return 0;
}

function scoreManagementPriority(variety: VarietyRecord, answers: FarmerAnswers): number {
  const value = answers.managementPriority;
  if (!value || value === 'any') return 0;

  switch (variety.cropId) {
    case 'potato':
      if (value === 'early-harvest') {
        if (variety.maturityStage === '조생') return 2;
        if (variety.maturityStage.includes('조')) return 1;
        return 0;
      }
      if (value === 'processing') return variety.usageTags.includes('가공') ? 2 : 0;
      if (value === 'pest-mgmt') {
        if (variety.pestNote.includes('저항성')) return 2;
        if (variety.pestNote.includes('중도저항성') || variety.pestNote.includes('저항')) return 1;
        return 0;
      }
      return 0;
    case 'corn':
      if (value === 'wet-lodging') {
        if (variety.pestNote.includes('쓰러짐') && variety.pestNote.includes('강')) return 2;
        if (variety.hazards.wet.score >= 1 && variety.hazards.wet.evidenceType !== 'common') return 1;
        return 0;
      }
      if (value === 'pest-mgmt') return variety.pestNote.includes('저항성') ? 2 : 0;
      if (value === 'processing') return variety.usageTags.includes('가공') ? 2 : 0;
      return 0;
    case 'peach':
      if (value === 'bagging') return variety.pestNote.includes('무봉지') ? 2 : 0;
      if (value === 'logistics-firm') {
        if (variety.textureTags.some((t) => t.includes('단단'))) return 2;
        if (hasAnyTag(variety.usageTags, ['온라인택배', '택배'])) return 1;
        return 0;
      }
      if (value === 'harvest-spread') return variety.harvestMonths.length >= 2 ? 2 : 0;
      return 0;
    case 'apple':
      if (value === 'coloring') {
        if (variety.hazards.heat.reasonText.includes('착색') && variety.hazards.heat.evidenceType === 'direct') {
          return 2;
        }
        if (variety.hazards.heat.reasonText.includes('착색')) return 1;
        return 0;
      }
      if (value === 'storage') {
        if (variety.usageTags.includes('온라인택배')) return 2;
        if (variety.usageText.includes('저장')) return 1;
        return 0;
      }
      if (value === 'harvest-spread') return variety.harvestMonths.length >= 2 ? 2 : 0;
      return 0;
    case 'cabbage':
      if (value === 'heat') return hazardDirectIndirectScore(variety, 'heat');
      if (value === 'drought') return hazardDirectIndirectScore(variety, 'drought');
      if (value === 'wet') return hazardDirectIndirectScore(variety, 'wet');
      if (value === 'fast-heading') {
        if (variety.maturityStage === '조생') return 2;
        if (variety.maturityStage.includes('조')) return 1;
        return 0;
      }
      return 0;
    default:
      return 0;
  }
}

function scoreOrchardExtras(variety: VarietyRecord, answers: FarmerAnswers): number {
  if (!isOrchardCrop(variety.cropId)) return 0;
  let score = 0;

  // FA2: 줄이고 싶은 작업 - 품종의 직접 특성과 일치하면 +2
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

  // FA3: 유통에서 중요한 조건
  switch (answers.logistics) {
    case 'few-days':
    case 'delivery':
      if (hasAnyTag(variety.usageTags, ['온라인택배', '택배']) || variety.textureTags.some((t) => t.includes('단단'))) {
        score += 2;
      }
      break;
    case 'holiday':
      if (variety.usageTags.includes('명절')) score += 2;
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
    if (info.evidenceType !== 'common' && info.score >= 1) {
      candidates.push({
        score: climateBaseGain(info.score) * EVIDENCE_COEFFICIENT[info.evidenceType],
        text: `${HAZARD_LABEL[hazard]} 관련 ${info.evidenceType === 'direct' ? '직접' : '간접'} 근거가 있어요: ${info.reasonText}`,
      });
    }
  });
  if (breakdown.harvestTiming > 0) {
    candidates.push({ score: breakdown.harvestTiming, text: `숙기(${variety.maturityStage})가 원하는 수확 시기와 맞아요.` });
  }
  if (breakdown.usage > 0) {
    candidates.push({ score: breakdown.usage, text: `${variety.usageText} 용도로 활용하기 좋아요.` });
  }
  if (breakdown.pest > 0) {
    candidates.push({ score: breakdown.pest, text: `병해충 관련 강점이 있어요: ${variety.pestNote}` });
  }
  if (breakdown.managementPriority > 0) {
    candidates.push({ score: breakdown.managementPriority, text: '선택하신 관리 우선순위와 잘 맞는 특성이 있어요.' });
  }
  if (breakdown.orchard > 0) {
    candidates.push({ score: breakdown.orchard, text: '원하시는 작업 부담 절감·유통 조건과 맞는 특성이 있어요.' });
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
  if (answers.irrigation === 'difficult' && variety.hazards.drought.evidenceType !== 'direct') {
    cautions.push('관수가 어려운 조건이라면 생육기 수분 관리에 특히 신경 써주세요.');
  }
  if (variety.pestNote && variety.pestNote !== '자료없음') {
    cautions.push(`병해충 참고: ${variety.pestNote}`);
  }
  return cautions;
}

export function scoreFarmerVariety(variety: VarietyRecord, answers: FarmerAnswers): FarmerRecommendation {
  const region = scoreRegion(variety, answers);
  const breakdown: FarmerScoreBreakdown = {
    region: region.score,
    climate: scoreClimate(variety, answers.climateRisks),
    irrigation: scoreIrrigation(variety, answers),
    harvestTiming: scoreHarvestTiming(variety, answers),
    usage: scoreUsage(variety, answers),
    pest: scorePest(variety, answers),
    managementPriority: scoreManagementPriority(variety, answers),
    orchard: scoreOrchardExtras(variety, answers),
  };
  const totalScore = round1(
    breakdown.region +
      breakdown.climate +
      breakdown.irrigation +
      breakdown.harvestTiming +
      breakdown.usage +
      breakdown.pest +
      breakdown.managementPriority +
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
