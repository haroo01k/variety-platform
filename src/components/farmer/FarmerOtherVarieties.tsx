import { useState } from 'react';
import type { FarmerRecommendation } from '../../types/farmer';

interface FarmerOtherVarietiesProps {
  /** TOP 3 밖의 품종(점수 순) */
  items: { recommendation: FarmerRecommendation; rank: number }[];
  onSelect: (index: number) => void;
}

/**
 * 농업인 결과 화면의 '다른 품종도 살펴보기' 목록.
 * 전문가 자문(사과)에 따라 TOP 3 외의 품종도 볼 수 있게 하되, 화면이 복잡해지지 않도록
 * 기본은 접어 두고 품종명만 보여줍니다. 누르면 같은 상세보기로 비교할 수 있습니다.
 */
export function FarmerOtherVarieties({ items, onSelect }: FarmerOtherVarietiesProps) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[520px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-[44px] w-full items-center justify-center gap-1 rounded-full border border-[#F0E9D8] bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:border-brand-green hover:text-brand-green-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
      >
        다른 품종 {items.length}개 {open ? '접기' : '더 보기'}
        <span aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>
      {open && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {items.map(({ recommendation, rank }, i) => (
            <li key={recommendation.variety.id}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                className="min-h-[40px] rounded-full bg-[#FBF8EF] px-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-brand-green-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
              >
                <span className="mr-1 text-xs font-bold text-slate-400">{rank}위</span>
                {recommendation.variety.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
