interface ResultRankTabsProps {
  /** 선택 가능한 순위 개수(top3라 보통 1~3). */
  count: number;
  /** 0-based로 선택된 순위 인덱스. */
  selectedIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}

const RANK_LABELS = ['1순위', '2순위', '3순위'];
const RANK_MEDALS = ['🥇', '🥈', '🥉'];

/**
 * 농업인/소비자 결과 화면 공용 "TOP 3 순위 선택" pill 탭.
 * 선택된 순위만 큰 카드 한 장으로 보여주는 구조에서, 어떤 순위를 보여줄지 고르는 용도입니다.
 */
export function ResultRankTabs({ count, selectedIndex, onSelect, className = '' }: ResultRankTabsProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`} role="tablist" aria-label="추천 순위 선택">
      {Array.from({ length: count }, (_, index) => index).map((index) => {
        const isSelected = index === selectedIndex;
        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(index)}
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green ${
              isSelected
                ? 'border-brand-green bg-brand-green text-white'
                : 'border-slate-200 bg-[#FBF8EF] text-slate-600 hover:border-brand-green'
            }`}
          >
            <span aria-hidden="true">{RANK_MEDALS[index]}</span>
            {RANK_LABELS[index]}
          </button>
        );
      })}
    </div>
  );
}
