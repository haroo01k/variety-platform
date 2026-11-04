interface ConsumerAnswerCardProps {
  /** 'A' 또는 'B' */
  label: string;
  icon: string;
  text: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

/**
 * 취향 테스트의 A/B 선택지 카드. 아이콘 + 선택지 문구를 큰 카드로 보여주고,
 * 선택하면 소비자 코너의 노란 톤으로 색이 바뀝니다.
 */
export function ConsumerAnswerCard({ label, icon, text, selected, disabled = false, onSelect }: ConsumerAnswerCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={`flex min-h-[88px] w-full items-center gap-4 rounded-3xl border-2 p-4 text-left transition-[background-color,border-color,transform] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange motion-safe:active:scale-[0.98] sm:p-5 ${
        selected
          ? 'border-brand-yellow bg-brand-yellow/20'
          : 'border-slate-200 bg-white shadow-sm hover:border-brand-yellow/60 hover:bg-brand-yellow/5'
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl transition-colors duration-200 ${
          selected ? 'bg-white' : 'bg-brand-yellow/20'
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-xs font-extrabold ${selected ? 'text-brand-orange' : 'text-slate-400'}`}>{label}</span>
        <span className="mt-0.5 block text-base font-bold text-slate-800 sm:text-lg">{text}</span>
      </span>
      {selected && (
        <span aria-hidden="true" className="shrink-0 text-lg font-bold text-brand-orange">
          ✓
        </span>
      )}
    </button>
  );
}
