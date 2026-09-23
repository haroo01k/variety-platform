interface ConsumerChoiceButtonProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

/**
 * 소비자 화면의 단일 선택 카드 버튼(활용·맛·식감·새로움 등).
 * 농업인 화면의 ChoiceButton과 위치·크기는 같지만, 더 밝고 친근한 노란 톤을 씁니다.
 */
export function ConsumerChoiceButton({ label, selected, onSelect }: ConsumerChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex min-h-[44px] w-full items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange ${
        selected
          ? 'border-brand-yellow bg-brand-yellow/15 text-brand-orange'
          : 'border-slate-200 bg-white text-slate-700 hover:border-brand-yellow/50'
      }`}
    >
      <span className="text-sm font-semibold">{label}</span>
      {selected && (
        <span aria-hidden="true" className="shrink-0 text-brand-orange">
          ✓
        </span>
      )}
    </button>
  );
}
