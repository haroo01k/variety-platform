import type { FarmerRecommendation } from '../../types/farmer';
import { getGrowthTraits, getRegionSummary } from '../../lib/varietyTraits';

interface FarmerOtherVarietiesProps {
  /** TOP 3 밖의 품종(점수 순) */
  items: { recommendation: FarmerRecommendation; rank: number }[];
  onSelect: (index: number) => void;
}

/**
 * 농업인 결과 화면의 '다른 품종도 살펴보기' 목록.
 * 전문가 자문(사과)에 따라 TOP 3 외의 품종도 함께 보여주고, 누르면 같은 상세보기로 비교할 수 있게 합니다.
 */
export function FarmerOtherVarieties({ items, onSelect }: FarmerOtherVarietiesProps) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[520px]">
      <h2 className="text-base font-extrabold text-brand-green-dark">다른 품종도 살펴보기</h2>
      <p className="mt-1 text-xs text-slate-500">눌러서 TOP 3 품종과 비교해 보세요.</p>
      <ul className="mt-3 divide-y divide-[#F0E9D8] overflow-hidden rounded-2xl border border-[#F0E9D8] bg-white">
        {items.map(({ recommendation, rank }, i) => {
          const { variety, totalScore } = recommendation;
          const growth = getGrowthTraits(variety);
          return (
            <li key={variety.id}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#FBF8EF] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-green"
              >
                <span className="w-9 shrink-0 text-xs font-bold text-slate-400">{rank}위</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-700">{variety.name}</span>
                  <span className="block truncate text-xs text-slate-400">
                    {growth.maturity} · {getRegionSummary(variety)}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-brand-green-dark">{totalScore}점</span>
                <span aria-hidden="true" className="shrink-0 text-slate-300">
                  ›
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
