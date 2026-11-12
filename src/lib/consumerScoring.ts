/**
 * 소비자 농산물 취향 테스트 점수 계산 엔진.
 * 1) 작물 결정: 첫 질문에서 고른 작물, 또는 작물 찾기 질문 2개의 답이 함께 가리키는 작물
 * 2) 품종 점수: 그 작물의 질문 3개 중 답과 맞은 질문 수(0~1로 정규화)
 *    질문은 같은 작물 5개 품종이 서로 다른 답 조합을 갖게 짜여 있어, 품종마다 1위가 되는 조합이 있습니다.
 * 3) 동점: 응답 조합과 품종 ID로 만든 해시 순서. 같은 응답이면 항상 같은 결과지만,
 *    특정 품종(ID가 빠른 품종)이 동점에서 늘 이기지는 않습니다.
 * 4) 취향 유형·키워드: 고른 선택지에 붙은 type/keyword로 정하는 결과 화면용 라벨(추천 순위에는 영향 없음)
 * 질문 정의: src/data/consumerQuiz.ts
 */
import type { ConsumerAnswers, ConsumerCropId, ConsumerRecommendation, ConsumerResult, TasteTypeId } from '../types/consumer';
import { VARIETIES } from '../data/varieties';
import { CROP_FINDER_QUESTIONS, CROP_PICK_QUESTION, CROP_QUESTIONS, TASTE_TYPES } from '../data/consumerQuiz';
import type { QuizOption, QuizQuestion } from '../data/consumerQuiz';

const CROP_IDS = Object.keys(CROP_QUESTIONS) as ConsumerCropId[];

const isCropId = (value: string | undefined): value is ConsumerCropId => CROP_IDS.includes(value as ConsumerCropId);

const findOption = (question: QuizQuestion, answers: ConsumerAnswers): QuizOption | undefined =>
  question.options.find((o) => o.id === answers[question.id]);

/** 작물 찾기 질문 답에서 가장 많이 가리킨 작물. 아직 다 답하지 않았으면 null */
function findCropFromFinder(answers: ConsumerAnswers): ConsumerCropId | null {
  const votes = new Map<ConsumerCropId, number>();
  for (const question of CROP_FINDER_QUESTIONS) {
    const option = findOption(question, answers);
    if (!option) return null;
    option.crops?.forEach((c) => votes.set(c, (votes.get(c) ?? 0) + 1));
  }
  let best: ConsumerCropId | null = null;
  for (const crop of CROP_IDS) {
    if ((votes.get(crop) ?? 0) > (best ? (votes.get(best) ?? 0) : 0)) best = crop;
  }
  return best;
}

/** 지금까지의 답으로 정해진 작물. 아직 정해지지 않았으면 null */
export function resolveCrop(answers: ConsumerAnswers): ConsumerCropId | null {
  const pick = answers[CROP_PICK_QUESTION.id];
  if (isCropId(pick)) return pick;
  if (pick === 'unsure') return findCropFromFinder(answers);
  return null;
}

/**
 * 지금까지의 답에 따라 보여줄 질문 순서.
 * 작물 선택 → (잘 모르겠어요면 작물 찾기 2개) → (작물이 정해지면) 품종 나누기 3개
 */
export function getQuestionSequence(answers: ConsumerAnswers): QuizQuestion[] {
  const sequence: QuizQuestion[] = [CROP_PICK_QUESTION];
  if (answers[CROP_PICK_QUESTION.id] === 'unsure') sequence.push(...CROP_FINDER_QUESTIONS);
  const crop = resolveCrop(answers);
  if (crop) sequence.push(...CROP_QUESTIONS[crop]);
  return sequence;
}

/** 아직 작물이 정해지지 않았을 때 진행률 표시에 쓰는 예상 전체 질문 수 */
export function estimateTotalQuestions(answers: ConsumerAnswers): number {
  const finder = answers[CROP_PICK_QUESTION.id] === 'unsure' ? CROP_FINDER_QUESTIONS.length : 0;
  return 1 + finder + CROP_QUESTIONS.apple.length;
}

/** 동점 순서용 FNV-1a 해시 */
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const round3 = (n: number) => Math.round(n * 1000) / 1000;

/** 고른 선택지의 type 표가 가장 많은 유형. 동점이면 나중에 고른 답의 유형이 우선합니다. */
function decideTasteType(options: QuizOption[]): TasteTypeId {
  const votes = new Map<TasteTypeId, number>();
  options.forEach((o) => o.type && votes.set(o.type, (votes.get(o.type) ?? 0) + 1));
  const max = Math.max(0, ...votes.values());
  for (let i = options.length - 1; i >= 0; i -= 1) {
    const type = options[i].type;
    if (type && votes.get(type) === max) return type;
  }
  return TASTE_TYPES[0].id;
}

export function getConsumerRecommendation(answers: ConsumerAnswers): ConsumerResult {
  const cropId = resolveCrop(answers) ?? CROP_IDS[0];
  const questions = CROP_QUESTIONS[cropId];
  const chosen = questions.map((q) => findOption(q, answers)).filter((o): o is QuizOption => o !== undefined);
  const seed = questions.map((q) => answers[q.id] ?? '').join('|');

  const ranked: ConsumerRecommendation[] = VARIETIES.filter((v) => v.cropId === cropId)
    .map((variety) => {
      const matched = chosen.filter((o) => o.varieties?.includes(variety.id));
      const reasons = matched.map((o) => o.reason).filter((r): r is string => Boolean(r));
      return {
        variety,
        totalScore: round3(questions.length > 0 ? matched.length / questions.length : 0),
        reasons: [reasons[reasons.length - 1] ?? variety.tasteSummary],
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore || hash(seed + a.variety.id) - hash(seed + b.variety.id));

  const keywords = [...new Set(chosen.map((o) => o.keyword).filter((k): k is string => Boolean(k)))].slice(0, 3);

  return { cropId, typeId: decideTasteType(chosen), keywords, ranked, top3: ranked.slice(0, 3) };
}
