interface ChoiceChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

/**
 * 복수 선택 질문(기상위험, 판로와 용도, 병해충 등)에 쓰는 칩(pill) 버튼.
 * 여러 개를 동시에 선택할 수 있고, 선택 여부는 부모(단계 컴포넌트)가 관리합니다.
 */
export function ChoiceChip({ label, selected, onToggle }: ChoiceChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-2 px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green ${
        selected
          ? 'border-brand-green bg-brand-green-light text-brand-green-dark'
          : 'border-slate-200 bg-white text-slate-600 hover:border-brand-green/50'
      }`}
    >
      {selected && <span aria-hidden="true">✓</span>}
      {label}
    </button>
  );
}
