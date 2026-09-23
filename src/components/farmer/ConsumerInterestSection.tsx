import { useEffect, useState } from 'react';
import { PlaceholderImage } from '../common/PlaceholderImage';
import { getLikeCounts } from '../../lib/likes';
import { VARIETIES } from '../../data/varieties';
import type { CropId } from '../../types/crop';

interface ConsumerInterestSectionProps {
  cropId: CropId;
  emoji: string;
  /** 재배 조건 추천 1위 품종ID (동일 품종 여부 비교용) */
  farmerTop1Id?: string;
  farmerTop1Name?: string;
}

interface InterestItem {
  varietyId: string;
  name: string;
  hexColor: string;
  tasteSummary: string;
  likeCount: number;
}

/** 이 정도는 넘어야 "순위"로 보여줄 만하다고 보는 최소 좋아요 수 (그 미만이면 데이터 부족 안내) */
const MIN_MEANINGFUL_LIKES = 3;

type LoadState = 'loading' | 'ready' | 'error';

/**
 * 농업인 결과 화면 하단의 "소비자는 어떤 품종에 관심을 보였을까요?" 코너.
 * Supabase 좋아요 집계만 보여주는 읽기 전용 영역이며, 농업인 추천 점수·순위에는
 * 전혀 영향을 주지 않습니다. 조회에 실패해도 이 영역에만 재시도 안내가 뜨고
 * 나머지 추천 결과 화면은 그대로 유지됩니다.
 */
export function ConsumerInterestSection({
  cropId,
  emoji,
  farmerTop1Id,
  farmerTop1Name,
}: ConsumerInterestSectionProps) {
  const [items, setItems] = useState<InterestItem[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  // 요청 키(어떤 조건으로 조회했는지)와 "그 결과가 도착했는지"를 비교해서 로딩 여부를 판단합니다.
  // (effect 안에서 곧바로 setState('loading')을 호출하지 않기 위한 패턴)
  const requestKey = `${cropId}:${reloadKey}`;
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const cropVarieties = VARIETIES.filter((v) => v.cropId === cropId);
      const result = await getLikeCounts(cropVarieties.map((v) => v.id));
      if (cancelled) return;

      if (!result.ok) {
        setErrorKey(requestKey);
        return;
      }

      const sorted = cropVarieties
        .map((v) => ({
          varietyId: v.id,
          name: v.name,
          hexColor: v.characterColorHex,
          tasteSummary: v.tasteSummary,
          likeCount: result.value[v.id] ?? 0,
        }))
        .sort((a, b) => b.likeCount - a.likeCount || a.varietyId.localeCompare(b.varietyId));

      setItems(sorted);
      setResolvedKey(requestKey);
    })();

    return () => {
      cancelled = true;
    };
  }, [cropId, requestKey]);

  const state: LoadState = errorKey === requestKey ? 'error' : resolvedKey === requestKey ? 'ready' : 'loading';

  const [first, second, third] = items;
  const hasEnoughData = state === 'ready' && first && first.likeCount >= MIN_MEANINGFUL_LIKES;

  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-800">소비자는 어떤 품종에 관심을 보였을까요?</h2>
        <p className="mt-1 text-xs text-slate-400">
          같은 작물의 소비자 취향 테스트에서 받은 좋아요를 기준으로 보여드려요.
        </p>
      </div>

      {state === 'loading' && <p className="text-sm text-slate-400">소비자 관심 데이터를 불러오는 중이에요…</p>}

      {state === 'error' && (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
          <p>소비자 관심 데이터를 불러오지 못했어요.</p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-2 min-h-[44px] rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-600 hover:border-brand-green hover:text-brand-green-dark"
          >
            다시 시도
          </button>
        </div>
      )}

      {state === 'ready' && !hasEnoughData && (
        <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
          아직 소비자 관심 데이터가 충분하지 않아요.
        </p>
      )}

      {state === 'ready' && hasEnoughData && first && (
        <>
          <div className="flex items-center gap-4 rounded-2xl border border-brand-yellow/40 bg-brand-yellow/10 p-4">
            <PlaceholderImage emoji={emoji} hexColor={first.hexColor} className="h-16 w-16 shrink-0 text-3xl" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-brand-orange">소비자 관심 1위</p>
              <p className="text-lg font-bold text-slate-800">{first.name}</p>
              <p className="text-xs text-slate-500">{first.tasteSummary}</p>
            </div>
            <p className="shrink-0 text-sm font-bold text-rose-500">
              <span aria-hidden="true">♥</span> {first.likeCount}
            </p>
          </div>

          {(second || third) && (
            <div className="grid grid-cols-2 gap-3 max-[359px]:grid-cols-1">
              {[second, third].filter((item): item is InterestItem => Boolean(item)).map((item, i) => (
                <div key={item.varietyId} className="rounded-2xl bg-slate-50 p-3 text-center">
                  <p className="text-xs font-semibold text-slate-400">{i === 0 ? '🥈 2위' : '🥉 3위'}</p>
                  <PlaceholderImage emoji={emoji} hexColor={item.hexColor} className="mx-auto mt-1 h-12 w-12 text-2xl" />
                  <p className="mt-1 text-sm font-bold text-slate-800">{item.name}</p>
                  <p className="text-xs font-semibold text-rose-500">
                    <span aria-hidden="true">♥</span> {item.likeCount}
                  </p>
                </div>
              ))}
            </div>
          )}

          <p className="whitespace-pre-line rounded-2xl bg-brand-green-light px-4 py-3 text-sm text-brand-green-dark">
            {farmerTop1Id === first.varietyId
              ? '재배 조건 추천과 소비자 관심도가 모두 높은 품종이에요.'
              : `재배 조건 추천 1위: ${farmerTop1Name ?? '-'}\n소비자 관심 1위: ${first.name}`}
          </p>
        </>
      )}

      <p className="text-xs text-slate-400">
        소비자 추천 결과에서 수집된 관심도 참고 지표이며, 실제 구매량이나 시장수요를 의미하지 않습니다.
      </p>
    </section>
  );
}
