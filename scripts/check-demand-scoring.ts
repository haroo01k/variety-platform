/**
 * 소비자 관심도(참고 지표) 계산 검증 스크립트 (src/lib/demandScoring.ts).
 * 가짜 하트·노출 수를 넣고 아래를 확인합니다. 하나라도 어긋나면 실패(exit 1)합니다.
 *  1) 보정 하트율 공식 (하트+1)/(노출+5)
 *  2) 노출이 적은 품종(10 미만)은 관심도를 계산하지 않음
 *  3) 관심도를 어떻게 넣어도 추천 점수·순위는 그대로 (5개 작물 × 기상위험 조합)
 *  4) 높음·보통·낮음 라벨이 작물 안 상대 비교로 붙음
 *  5) 스위치(비슷한 점수는 관심도 순): 0.3점 이내끼리만 자리 바뀜, 점수 불변, 노출 부족·기후 음수 품종은 제자리
 *
 * 사용법: npx rolldown scripts/check-demand-scoring.ts --platform node --format esm -o /tmp/check-demand.mjs && node /tmp/check-demand.mjs
 */
import { getFarmerRecommendation } from '../src/lib/farmerScoring';
import { attachConsumerDemand, demandLevel, displayRanks, reorderNearTiesByDemand, smoothedLikeRate } from '../src/lib/demandScoring';
import type { DemandStat } from '../src/lib/demandScoring';
import type { FarmerAnswers, FarmerResult } from '../src/types/farmer';

let failures = 0;
function check(name: string, ok: boolean) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures += 1;
}
const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;

// 1) 공식 -----------------------------------------------------------------
check('보정 하트율: 노출 100·하트 20 → 21/105', near(smoothedLikeRate(20, 100), 21 / 105));
check('보정 하트율: 노출 2·하트 2 → 3/7', near(smoothedLikeRate(2, 2), 3 / 7));
check('보정 하트율: 노출 0·하트 0 → 0.2', near(smoothedLikeRate(0, 0), 0.2));
check('보정 하트율: 노출 기록보다 하트가 많으면 하트를 노출로 봄', near(smoothedLikeRate(8, 3), 9 / 13));
check(
  '라벨: 1 → 높음, 0.5 → 보통, 0 → 낮음, null → 없음',
  demandLevel(1) === '높음' && demandLevel(0.5) === '보통' && demandLevel(0) === '낮음' && demandLevel(null) === null,
);

const base: FarmerAnswers = {
  cropId: 'potato',
  region: 'highland',
  climateRisks: ['heat'],
  harvestTiming: 'any',
  cropSeason: null,
  potatoHarvestTiming: null,
  harvestMonth: '8',
  tastes: [],
  usages: ['fresh'],
  pestConcerns: [],
  winterMin: 'unknown',
  reduceWork: 'none',
};
const snapshot = (r: FarmerResult) =>
  JSON.stringify({
    ranked: r.ranked.map((x) => [x.variety.id, x.totalScore]),
    top3: r.top3.map((x) => [x.variety.id, x.totalScore]),
    isCloseCall: r.isCloseCall,
  });

// 2) 노출이 적으면 계산 안 함 ------------------------------------------------
{
  const result = getFarmerRecommendation(base);
  const stats: Record<string, DemandStat> = {};
  result.ranked.forEach((r) => (stats[r.variety.id] = { likes: 3, views: 5 }));
  const attached = attachConsumerDemand(result, stats);
  check('노출 10 미만이면 관심도 null', attached.ranked.every((r) => r.demand?.rate === null && r.demand?.normalized === null));
}

// 3) 점수·순위 불변: 하위 품종일수록 하트를 몰아줘도 그대로 ----------------------
{
  const crops = ['potato', 'corn', 'peach', 'apple', 'cabbage'] as const;
  const riskSets: FarmerAnswers['climateRisks'][] = [[], ['heat'], ['drought'], ['wet'], ['heat', 'drought', 'wet']];
  let cases = 0;
  let unchanged = true;
  crops.forEach((cropId) =>
    riskSets.forEach((climateRisks) => {
      const result = getFarmerRecommendation({ ...base, cropId, climateRisks });
      const stats: Record<string, DemandStat> = {};
      const n = result.ranked.length;
      result.ranked.forEach((r, i) => (stats[r.variety.id] = { likes: Math.round((90 * i) / Math.max(1, n - 1)), views: 100 }));
      const attached = attachConsumerDemand(result, stats);
      cases += 1;
      if (snapshot(result) !== snapshot(attached)) unchanged = false;
    }),
  );
  check(`관심도를 넣어도 점수·순위 그대로 (${cases}개 조합)`, unchanged);
}

// 4) 라벨 예시 ------------------------------------------------------------------
{
  const result = getFarmerRecommendation(base);
  const sample = [
    { likes: 20, views: 100 },
    { likes: 2, views: 2 },
    { likes: 16, views: 40 },
    { likes: 0, views: 30 },
    { likes: 5, views: 8 },
  ];
  const stats: Record<string, DemandStat> = {};
  result.ranked.forEach((r, i) => (stats[r.variety.id] = sample[i % sample.length]));
  const attached = attachConsumerDemand(result, stats);
  const rated = attached.ranked.filter((r) => r.demand && r.demand.normalized !== null);
  check(
    '노출 충분한 품종 중 하트율 최고는 높음, 최저는 낮음',
    rated.some((r) => demandLevel(r.demand!.normalized) === '높음') && rated.some((r) => demandLevel(r.demand!.normalized) === '낮음'),
  );
  console.log('\n  품종      점수   하트/노출   하트율   관심도');
  attached.ranked.forEach((r) => {
    const d = r.demand!;
    console.log(
      `  ${r.variety.name.padEnd(6)} ${String(r.totalScore).padStart(5)}   ${String(d.likes).padStart(3)}/${String(d.views).padEnd(4)}   ${
        d.rate === null ? '  -  ' : d.rate.toFixed(3)
      }   ${demandLevel(d.normalized) ?? '응답 적음'}`,
    );
  });
}

// 5) 스위치: 점수가 비슷한 품종끼리만 관심도 순 ---------------------------------
{
  const real = getFarmerRecommendation(base);
  // 가짜 점수로 상황을 직접 만듭니다: 6.3 / 6.1 / 6.0 / 5.5 / 5.4
  const scores = [6.3, 6.1, 6.0, 5.5, 5.4];
  const climate = [1, 1, -1, 1, 1]; // 3번째는 기후 점수 음수
  const fake: FarmerResult = {
    ...real,
    ranked: real.ranked.map((r, i) => ({ ...r, totalScore: scores[i], breakdown: { ...r.breakdown, climate: climate[i] } })),
  };
  fake.top3 = fake.ranked.slice(0, 3);
  const ids = fake.ranked.map((r) => r.variety.id);
  const stats: Record<string, DemandStat> = {
    [ids[0]]: { likes: 5, views: 100 }, // 관심도 낮음
    [ids[1]]: { likes: 60, views: 100 }, // 관심도 높음 → 1위 자리로
    [ids[2]]: { likes: 90, views: 100 }, // 관심도 최고지만 기후 음수 → 제자리
    [ids[3]]: { likes: 90, views: 100 }, // 관심도 최고지만 6.3과 0.8 차이 → 다른 묶음
    [ids[4]]: { likes: 0, views: 3 }, // 노출 부족 → 제자리
  };
  const attached = attachConsumerDemand(fake, stats);
  const { result: re, movedCount } = reorderNearTiesByDemand(attached, ['heat']);
  const order = re.ranked.map((r) => ids.indexOf(r.variety.id));
  check(`0.3점 이내(6.3·6.1)만 자리 바뀜 → 순서 ${order.join(',')}`, order.join(',') === '1,0,2,3,4');
  check('기후 점수 음수 품종(6.0)은 관심도 최고여도 제자리', order[2] === 2);
  check('0.3점 밖 품종(5.5)은 관심도 최고여도 위 묶음으로 못 올라감', order[3] === 3);
  check('바뀐 품종 수 2', movedCount === 2);
  check('스위치를 켜도 점수는 그대로', re.ranked.every((r) => r.totalScore === scores[ids.indexOf(r.variety.id)]));
  check('기상위험을 안 고르면 기후 관문 없이 6.0 품종도 움직일 수 있음', reorderNearTiesByDemand(attached, []).result.ranked[0].variety.id === ids[2]);
  check('표시 순위: 8.1, 8.1, 6.3 → 1, 1, 3', displayRanks([{ totalScore: 8.1 }, { totalScore: 8.1 }, { totalScore: 6.3 }] as never).join(',') === '1,1,3');
  check('실제 감자(관심도 없음)에서는 스위치를 켜도 순서 그대로', reorderNearTiesByDemand(real, ['heat']).movedCount === 0);
}

console.log(failures === 0 ? '\n모든 확인 통과' : `\n실패 ${failures}건`);
process.exit(failures === 0 ? 0 : 1);
