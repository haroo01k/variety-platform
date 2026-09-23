/**
 * 소비자 취향 테스트 점수 계산 엔진.
 * 최종점수 = 취향유형 + 활용 + 맛·특징 + 식감 + 새로움 + 과수 조건부 점수(C6·C7)
 * 참고: Claude_업로드용_추천질문지_및_점수로직.pdf 5~6쪽.
 */
import type { ConsumerAnswers, ConsumerRecommendation, ConsumerResult, ConsumerScoreBreakdown } from '../types/consumer';
import type { VarietyRecord } from '../types/variety';
import { VARIETIES } from '../data/varieties';
import {
  ACTIVITY_OPTIONS,
  CONSUMER_HARVEST_MONTH_OPTIONS,
  CONSUMER_STORAGE_OPTIONS,
  FLAVOR_OPTIONS,
  NOVELTY_OPTIONS,
  TEXTURE_OPTIONS,
  tasteTypeDisplayLabel,
} from '../data/consumerOptions';
import { isOrchardCrop } from '../data/farmerOptions';
import { hasAnyTag, round1 } from './tagUtils';

const ORCHARD_MONTHS: Record<ConsumerAnswers['harvestMonth'], string[]> = {
  '6-7': ['6', '7'],
  '8': ['8'],
  '9': ['9'],
  '10': ['10'],
};

function scoreTasteType(variety: VarietyRecord, answers: ConsumerAnswers): number {
  return variety.tasteType === answers.tasteType ? 3 : 0;
}

function scoreActivity(variety: VarietyRecord, answers: ConsumerAnswers): number {
  const option = ACTIVITY_OPTIONS[variety.cropId].find((o) => o.value === answers.activity);
  if (!option) return 0;
  return hasAnyTag(variety.activityTags, option.tags) ? 2 : 0;
}

function scoreFlavor(variety: VarietyRecord, answers: ConsumerAnswers): number {
  const option = FLAVOR_OPTIONS[variety.cropId].find((o) => o.value === answers.flavor);
  if (!option) return 0;
  return hasAnyTag(variety.tasteTags, option.tags) ? 2 : 0;
}

function scoreTexture(variety: VarietyRecord, answers: ConsumerAnswers): number {
  const option = TEXTURE_OPTIONS.find((o) => o.value === answers.texture);
  if (!option) return 0;
  return hasAnyTag(variety.textureTags, option.tags) ? 2 : 0;
}

function scoreNovelty(variety: VarietyRecord, answers: ConsumerAnswers): number {
  if (!answers.novelty || answers.novelty === 'any') return 0;
  return hasAnyTag(variety.noveltyTags, [answers.novelty]) ? 2 : 0;
}

function scoreOrchardExtras(variety: VarietyRecord, answers: ConsumerAnswers): number {
  if (!isOrchardCrop(variety.cropId)) return 0;
  let score = 0;

  const months = ORCHARD_MONTHS[answers.harvestMonth];
  if (months && variety.harvestMonths.some((m) => months.includes(m))) score += 2;

  if (answers.storage === 'few-days' || answers.storage === 'delivery-gift') {
    const sturdy =
      variety.textureTags.some((t) => t.includes('단단')) ||
      hasAnyTag(variety.usageTags, ['온라인택배', '택배']) ||
      variety.usageText.includes('저장');
    if (sturdy) score += 2;
  }

  return score;
}

/**
 * 점수 대신 화면에 보여줄 "취향 일치 이유" 문장을 만듭니다.
 * 소비자 화면에서는 숫자 점수를 적합 확률처럼 보여주지 않기 위해 사용합니다.
 */
function buildReasons(variety: VarietyRecord, answers: ConsumerAnswers, breakdown: ConsumerScoreBreakdown): string[] {
  const candidates: { score: number; text: string }[] = [];

  if (breakdown.tasteType > 0) {
    candidates.push({
      score: breakdown.tasteType,
      text: `${tasteTypeDisplayLabel(variety.tasteType)} 취향과 잘 맞아요.`,
    });
  }
  if (breakdown.activity > 0) {
    const label = ACTIVITY_OPTIONS[variety.cropId].find((o) => o.value === answers.activity)?.label;
    if (label) candidates.push({ score: breakdown.activity, text: `${label}(으)로 즐기기 좋은 품종이에요.` });
  }
  if (breakdown.flavor > 0) {
    const label = FLAVOR_OPTIONS[variety.cropId].find((o) => o.value === answers.flavor)?.label;
    if (label) candidates.push({ score: breakdown.flavor, text: `찾으시는 맛(${label})과 잘 맞아요.` });
  }
  if (breakdown.texture > 0) {
    const label = TEXTURE_OPTIONS.find((o) => o.value === answers.texture)?.label;
    if (label) candidates.push({ score: breakdown.texture, text: `좋아하시는 식감(${label})을 가지고 있어요.` });
  }
  if (breakdown.novelty > 0) {
    const label = NOVELTY_OPTIONS[variety.cropId].find((o) => o.value === answers.novelty)?.label;
    if (label) candidates.push({ score: breakdown.novelty, text: `${label}` });
  }
  if (breakdown.orchard > 0) {
    const monthLabel = CONSUMER_HARVEST_MONTH_OPTIONS.find((o) => o.value === answers.harvestMonth)?.label;
    const storageLabel = CONSUMER_STORAGE_OPTIONS.find((o) => o.value === answers.storage)?.label;
    if (monthLabel) candidates.push({ score: 1, text: `${monthLabel}에 딱 맞는 시기예요.` });
    if (storageLabel) candidates.push({ score: 1, text: `${storageLabel} 조건에도 잘 맞아요.` });
  }

  candidates.sort((a, b) => b.score - a.score);
  const top = candidates.slice(0, 2).map((c) => c.text);
  return top.length > 0 ? top : [`${variety.tasteSummary}`];
}

export function scoreConsumerVariety(variety: VarietyRecord, answers: ConsumerAnswers): ConsumerRecommendation {
  const breakdown: ConsumerScoreBreakdown = {
    tasteType: scoreTasteType(variety, answers),
    activity: scoreActivity(variety, answers),
    flavor: scoreFlavor(variety, answers),
    texture: scoreTexture(variety, answers),
    novelty: scoreNovelty(variety, answers),
    orchard: scoreOrchardExtras(variety, answers),
  };
  const totalScore = round1(
    breakdown.tasteType + breakdown.activity + breakdown.flavor + breakdown.texture + breakdown.novelty + breakdown.orchard,
  );

  return { variety, totalScore, breakdown, reasons: buildReasons(variety, answers, breakdown) };
}

function compareRecommendations(a: ConsumerRecommendation, b: ConsumerRecommendation): number {
  if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
  return a.variety.id.localeCompare(b.variety.id);
}

export function getConsumerRecommendation(answers: ConsumerAnswers): ConsumerResult {
  const candidates = VARIETIES.filter((v) => v.cropId === answers.cropId);
  const ranked = candidates.map((v) => scoreConsumerVariety(v, answers)).sort(compareRecommendations);
  const top3 = ranked.slice(0, 3);
  const isCloseCall = top3.length >= 2 && top3[0].totalScore - top3[1].totalScore <= 0.5;

  return { ranked, top3, isCloseCall };
}
