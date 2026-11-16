import { useEffect, useMemo, useState } from 'react';
import { VARIETIES } from '../../data/varieties';
import { CROPS } from '../../data/crops';
import { getLikeCounts, isSupabaseConfigured, LIKE_CHANGED_EVENT } from '../../lib/likes';
import type { LikeChangedDetail } from '../../lib/likes';
import { findMarketVariety } from '../../lib/varietyLookup';
import { toKoreanOnlyName } from '../../lib/varietyDisplayName';
import type { CropId } from '../../types/crop';

type FilterId = 'all' | CropId;

const FILTER_ORDER: CropId[] = ['apple', 'peach', 'corn', 'potato', 'cabbage'];
const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: '전체' },
  ...FILTER_ORDER.map((id) => ({ id, label: CROPS.find((c) => c.id === id)?.name ?? id })),
];
const ALL_IDS = VARIETIES.map((v) => v.id);
const TOP_N = 5;

type Status = 'loading' | 'ready' | 'error';

/** 꽉 찬 하트 아이콘(글꼴마다 ♥ 모양이 달라 SVG로 통일) */
function FilledHeart({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 21s-6.7-4.35-9.33-8.04C.8 10.33 1.5 6.6 4.6 5.3c2.2-.92 4.47-.1 5.9 1.6L12 8.6l1.5-1.7c1.43-1.7 3.7-2.52 5.9-1.6 3.1 1.3 3.8 5.03 1.93 7.66C18.7 16.65 12 21 12 21z" />
    </svg>
  );
}

/** 순위 배지 색: 1위 노랑, 2·3위 연두, 그 외 회색 */
const rankBadgeClass = (rank: number) =>
  rank === 1
    ? 'bg-brand-yellow text-white'
    : rank <= 3
      ? 'bg-brand-green-light text-brand-green-dark'
      : 'bg-slate-100 text-slate-500';

interface InterestRankingProps {
  /** 제목 아래 한 줄 설명 */
  subtitle: string;
  /** 하트 참여가 아직 하나도 없을 때 안내 */
  emptyMessage: string;
  /** 순위 아래 작은 안내 문구(선택) */
  footnote?: string;
}

/**
 * "소비자가 주목하는 신품종" 관심도 순위(소비자 결과 화면·농업인 결과 화면 하단 공용).
 * Supabase에 기록된 품종별 "먹어보고 싶어요" 누적 수만으로 순위를 매기며(가상 데이터 없음),
 * 보기 전용 통계라 카드 수집·저장·공유·하트 참여는 제공하지 않습니다. 추천 점수·순위에도 쓰지 않습니다.
 * - 전체: 하트가 1개 이상인 품종 중 상위 5개
 * - 작물별: 그 작물에 하트가 하나라도 있으면 5개 품종 모두를 관심도 순으로(하트가 없는 품종은 0)
 * - 같은 수면 품종명 가나다순, 순위는 같은 수끼리 같은 등수(1, 2, 2, 4…)
 * - 필터는 화면 안에서만 바뀌며(새로고침 없음), 화면을 열 때마다 최신 집계를 다시 조회합니다.
 */
export function InterestRanking({ subtitle, emptyMessage, footnote }: InterestRankingProps) {
  const [filter, setFilter] = useState<FilterId>('all');
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [status, setStatus] = useState<Status>(isSupabaseConfigured ? 'loading' : 'error');

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    (async () => {
      const result = await getLikeCounts(ALL_IDS);
      if (cancelled) return;
      if (result.ok) {
        setCounts(result.value);
        setStatus('ready');
      } else {
        setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setStatus('loading');
    setReloadKey((k) => k + 1);
  };

  // 같은 화면에서 TOP 1 하트를 누르면 서버가 돌려준 실제 누적 수로 바로 갱신
  useEffect(() => {
    const onChanged = (event: Event) => {
      const { varietyId, likeCount } = (event as CustomEvent<LikeChangedDetail>).detail;
      setCounts((prev) => (prev ? { ...prev, [varietyId]: likeCount } : prev));
    };
    window.addEventListener(LIKE_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(LIKE_CHANGED_EVENT, onChanged);
  }, []);

  const rows = useMemo(() => {
    if (!counts) return [];
    const pool = VARIETIES.filter((v) => filter === 'all' || v.cropId === filter).map((v) => ({
      variety: v,
      name: toKoreanOnlyName(v.name),
      count: counts[v.id] ?? 0,
    }));
    if (pool.every((r) => r.count === 0)) return [];
    const sorted = (filter === 'all' ? pool.filter((r) => r.count > 0) : pool).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ko') || a.variety.id.localeCompare(b.variety.id),
    );
    return sorted.slice(0, TOP_N).map((row, _index, list) => ({
      ...row,
      rank: list.findIndex((r) => r.count === row.count) + 1,
    }));
  }, [counts, filter]);

  return (
    <section aria-labelledby="interest-ranking-title" className="flex w-full max-w-[520px] flex-col gap-3 text-left">
      <div>
        <h2 id="interest-ranking-title" className="flex items-center gap-1.5 text-lg font-extrabold text-brand-green-dark">
          소비자가 주목하는 신품종
          <FilledHeart className="h-5 w-5 text-rose-500" />
        </h2>
        <p className="mt-0.5 text-sm font-bold text-slate-500">{subtitle}</p>
      </div>

      <div role="group" aria-label="작물별 보기" className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`min-h-[36px] rounded-full px-3.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green ${
              filter === f.id
                ? 'border border-brand-green bg-brand-green font-bold text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-green'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {status === 'loading' && <p className="rounded-2xl bg-white px-4 py-5 text-center text-sm text-slate-500">관심도를 불러오는 중이에요.</p>}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-white px-4 py-5 text-center text-sm text-slate-500">
          <p>관심도 정보를 불러오지 못했어요.</p>
          {isSupabaseConfigured && (
            <button type="button" onClick={retry}className="min-h-[36px] rounded-full bg-brand-green-light px-4 text-sm font-semibold text-brand-green-dark">
              다시 불러오기
            </button>
          )}
        </div>
      )}

      {status === 'ready' && rows.length === 0 && (
        <p className="rounded-2xl bg-white px-4 py-5 text-center text-sm text-slate-500">{emptyMessage}</p>
      )}

      {status === 'ready' && rows.length > 0 && (
        <ol className="flex flex-col gap-1.5" aria-label={`${FILTERS.find((f) => f.id === filter)?.label} 관심도 순위`}>
          {rows.map((row) => {
            const image = findMarketVariety(row.variety.cropId, row.variety.name)?.image;
            return (
              <li
                key={row.variety.id}
                className={`flex items-center gap-3 rounded-2xl border bg-white px-3 py-2.5 ${
                  row.rank === 1 ? 'border-brand-yellow/60 shadow-sm' : 'border-transparent'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${rankBadgeClass(row.rank)}`}
                  aria-label={`${row.rank}위`}
                >
                  {row.rank}
                </span>
                {image ? (
                  <img src={image} alt="" aria-hidden="true" className="h-10 w-10 shrink-0 object-contain" />
                ) : (
                  <span aria-hidden="true" className="h-10 w-10 shrink-0" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[#20251F]">{row.name}</span>
                  <span className="block text-xs text-slate-500">{row.variety.cropName}</span>
                </span>
                <span
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-sm font-bold tabular-nums text-rose-500"
                  aria-label={`먹어보고 싶어요 ${row.count}명`}
                >
                  <FilledHeart className="h-3.5 w-3.5" />
                  {row.count}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {footnote && <p className="text-xs leading-relaxed text-slate-400">{footnote}</p>}
    </section>
  );
}
