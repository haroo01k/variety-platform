/**
 * 소비자 취향 테스트 검증 스크립트.
 * 가능한 모든 응답 경로(작물 직접 선택 + 잘 모르겠어요 경로)를 돌려서
 *  1) 25개 품종이 모두 1위로 나올 수 있는지
 *  2) 작물 찾기 질문으로 5개 작물이 모두 정해질 수 있는지
 *  3) 품종별 1위 횟수
 * 를 확인합니다. 1위가 안 나오는 품종이 있으면 실패(exit 1)합니다.
 *
 * 사용법: npx rolldown scripts/check-consumer-quiz.ts --platform node --format esm -o /tmp/check-quiz.mjs && node /tmp/check-quiz.mjs
 */
import { VARIETIES } from '../src/data/varieties';
import { CROP_FINDER_QUESTIONS, CROP_PICK_QUESTION, CROP_QUESTIONS } from '../src/data/consumerQuiz';
import type { QuizQuestion } from '../src/data/consumerQuiz';
import { getConsumerRecommendation, resolveCrop } from '../src/lib/consumerScoring';
import type { ConsumerAnswers } from '../src/types/consumer';

/** 질문 목록의 모든 답 조합 */
function combinations(questions: QuizQuestion[]): ConsumerAnswers[] {
  return questions.reduce<ConsumerAnswers[]>(
    (acc, q) => acc.flatMap((a) => q.options.map((o) => ({ ...a, [q.id]: o.id }))),
    [{}],
  );
}

const firstCount = new Map<string, number>();
const finderCrops = new Set<string>();
let paths = 0;

const starts: ConsumerAnswers[] = [
  ...CROP_PICK_QUESTION.options.filter((o) => o.id !== 'unsure').map((o) => ({ [CROP_PICK_QUESTION.id]: o.id })),
  ...combinations(CROP_FINDER_QUESTIONS).map((a) => ({ [CROP_PICK_QUESTION.id]: 'unsure', ...a })),
];

for (const start of starts) {
  const crop = resolveCrop(start);
  if (!crop) throw new Error(`작물이 정해지지 않는 경로: ${JSON.stringify(start)}`);
  if (start[CROP_PICK_QUESTION.id] === 'unsure') finderCrops.add(crop);
  for (const answers of combinations(CROP_QUESTIONS[crop])) {
    const result = getConsumerRecommendation({ ...start, ...answers });
    const top = result.top3[0].variety;
    firstCount.set(top.name, (firstCount.get(top.name) ?? 0) + 1);
    paths += 1;
  }
}

console.log(`응답 경로 ${paths}개`);
console.log(`잘 모르겠어요 경로로 정해지는 작물: ${[...finderCrops].join(', ')}`);
for (const v of VARIETIES) console.log(`${v.cropName}\t${v.name}\t1위 ${firstCount.get(v.name) ?? 0}회`);

const missing = VARIETIES.filter((v) => !firstCount.has(v.name)).map((v) => v.name);
const missingCrops = Object.keys(CROP_QUESTIONS).filter((c) => !finderCrops.has(c));
if (missing.length > 0 || missingCrops.length > 0) {
  console.error(`실패 — 1위가 안 나오는 품종: ${missing.join(', ') || '없음'} / 정해지지 않는 작물: ${missingCrops.join(', ') || '없음'}`);
  process.exit(1);
}
console.log('통과 — 25개 품종 모두 1위 가능, 5개 작물 모두 도달 가능');
