interface ChoiceButtonProps {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}

/**
 * 단일 선택 질문(지역, 관수 여건, 수확 시기 등)에 쓰는 카드형 버튼.
 * 한 화면에 여러 개를 세로로 나열해서 라디오 버튼 대신 사용합니다.
 */
export function ChoiceButton({ label, description, selected, onSelect }: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex min-h-[44px] w-full items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green ${
        selected
          ? 'border-brand-green bg-brand-green-light text-brand-green-dark'
          : 'border-slate-200 bg-white text-slate-700 hover:border-brand-green/50'
      }`}
    >
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-400">{description}</span>}
      </span>
      {selected && (
        <span aria-hidden="true" className="shrink-0 text-brand-green">
          ✓
        </span>
      )}
    </button>
  );
}
