/**
 * 소비자 관심도 계산(순수 함수, 서버 호출 없음). 농업인 추천 결과에 "참고 지표"로만 붙입니다.
 * 추천 점수·순위는 재배 적합도만으로 정하며, 관심도는 점수·순위에 전혀 반영하지 않습니다.
 *
 * 계산
 *  1) 노출 대비 하트율: 하트 수가 아니라 "하트를 누를 수 있는 화면(소비자 결과 TOP 1)에 보여진 기기 수" 대비
 *     비율을 씁니다. 데이터가 적을 때 비율이 튀지 않도록 (하트 + 1) / (노출 + 5)로 보정합니다.
 *  2) 데이터가 적으면 판단 안 함: 노출 기기 수가 DEMAND_MIN_VIEWS 미만인 품종은 관심도를 계산하지 않습니다.
 *  3) 작물 안에서 비교: 같은 작물 후보끼리 0~1로 바꿔 높음·보통·낮음 라벨을 붙입니다.
 *
 * 보정값·최소 노출 수는 근거 있는 값이 아니라 초기 설정값입니다.
 */
import type { FarmerRecommendation, FarmerResult } from '../types/farmer';

export interface DemandStat {
  /** 하트(먹어보고 싶어요) 누른 기기 수 */
  likes: number;
  /** 하트를 누를 수 있는 화면(소비자 결과 TOP 1)에 이 품종이 보여진 기기 수 */
  views: number;
}

export interface DemandInfo {
  likes: number;
  /** 계산에 쓴 노출 수(기록 시작 전 하트가 있으면 하트 수 이상으로 맞춤) */
  views: number;
  /** 보정 하트율. 노출이 적어 계산하지 않았으면 null */
  rate: number | null;
  /** 같은 작물 후보 안에서 0~1로 바꾼 값. 계산하지 않았으면 null */
  normalized: number | null;
}

export const DEMAND_PRIOR_LIKES = 1;
export const DEMAND_PRIOR_VIEWS = 5;
export const DEMAND_MIN_VIEWS = 10;

/** 노출 대비 하트율(보정). 노출 기록이 하트보다 적으면(기록 시작 전 하트) 하트 수를 노출로 봅니다. */
export function smoothedLikeRate(likes: number, views: number): number {
  const v = Math.max(views, likes);
  return (likes + DEMAND_PRIOR_LIKES) / (v + DEMAND_PRIOR_VIEWS);
}

/** 관심도 수준 라벨(정규화 값 기준) */
export function demandLevel(normalized: number | null): '높음' | '보통' | '낮음' | null {
  if (normalized === null) return null;
  if (normalized >= 2 / 3) return '높음';
  if (normalized <= 1 / 3) return '낮음';
  return '보통';
}

/**
 * 추천 결과의 각 품종에 소비자 관심도(참고 지표)를 붙입니다.
 * 점수(totalScore)·순서(ranked, top3)는 그대로 둡니다.
 */
export function attachConsumerDemand(result: FarmerResult, stats: Record<string, DemandStat>): FarmerResult {
  const rated = result.ranked.map((rec) => {
    const stat = stats[rec.variety.id] ?? { likes: 0, views: 0 };
    const views = Math.max(stat.views, stat.likes);
    const rate = views >= DEMAND_MIN_VIEWS ? smoothedLikeRate(stat.likes, stat.views) : null;
    return { rec, likes: stat.likes, views, rate };
  });

  const rates = rated.map((r) => r.rate).filter((r): r is number => r !== null);
  const min = Math.min(...rates);
  const max = Math.max(...rates);

  const byId = new Map<string, FarmerRecommendation>();
  rated.forEach(({ rec, likes, views, rate }) => {
    const normalized = rate === null ? null : max > min ? (rate - min) / (max - min) : 0.5;
    byId.set(rec.variety.id, { ...rec, demand: { likes, views, rate, normalized } });
  });

  const withDemand = (rec: FarmerRecommendation) => byId.get(rec.variety.id) ?? rec;
  return { ...result, ranked: result.ranked.map(withDemand), top3: result.top3.map(withDemand) };
}

/** 소비자 관심도로 순서를 바꿀 수 있는 점수 차(이 값 이내면 "비슷한 점수"로 봅니다). 초기 설정값입니다. */
export const DEMAND_NEAR_TIE = 0.3;

/**
 * (농업인이 결과 화면 스위치를 켰을 때만) 점수가 비슷한 품종끼리 소비자 관심도 높은 순으로 순서를 바꿉니다.
 *  - 점수(totalScore)는 바꾸지 않습니다.
 *  - 묶음: 아직 묶이지 않은 가장 높은 품종의 점수에서 DEMAND_NEAR_TIE 이내인 품종들
 *  - 묶음 안에서 관심도가 계산된 품종끼리만 자리를 바꾸고, 관심도가 없는 품종(노출 부족)은 제자리에 둡니다.
 *  - 기후 우선: 고른 기상위험에 대한 기후 점수가 음수인 품종도 제자리에 둡니다(관심도로 오르지 않음).
 * 반환: 바뀐 결과와, 원래보다 순서가 바뀐 품종 수
 */
export function reorderNearTiesByDemand(
  result: FarmerResult,
  climateRisks: string[],
): { result: FarmerResult; movedCount: number } {
  const original = result.ranked;
  const ordered = [...original];
  const movable = (rec: FarmerRecommendation) =>
    rec.demand?.normalized !== null &&
    rec.demand?.normalized !== undefined &&
    (climateRisks.length === 0 || rec.breakdown.climate >= 0);

  let start = 0;
  while (start < ordered.length) {
    const leaderScore = ordered[start].totalScore;
    let end = start;
    while (end + 1 < ordered.length && leaderScore - ordered[end + 1].totalScore <= DEMAND_NEAR_TIE + 1e-9) end += 1;

    const slots: number[] = [];
    for (let i = start; i <= end; i += 1) if (movable(ordered[i])) slots.push(i);
    const sorted = slots
      .map((i) => ordered[i])
      .sort((a, b) => (b.demand?.normalized ?? 0) - (a.demand?.normalized ?? 0));
    slots.forEach((slot, k) => {
      ordered[slot] = sorted[k];
    });
    start = end + 1;
  }

  const movedCount = ordered.filter((rec, i) => rec.variety.id !== original[i].variety.id).length;
  const top3 = ordered.slice(0, 3);
  return { result: { ...result, ranked: ordered, top3 }, movedCount };
}

/** 화면에 보여줄 순위: 앞 품종과 점수가 같으면 같은 순위, 아니면 자리 순서(공동 순위 표시용) */
export function displayRanks(ordered: FarmerRecommendation[]): number[] {
  const ranks: number[] = [];
  ordered.forEach((rec, i) => {
    ranks.push(i > 0 && rec.totalScore === ordered[i - 1].totalScore ? ranks[i - 1] : i + 1);
  });
  return ranks;
}
