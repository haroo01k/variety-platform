interface ConsumerPreferenceCardProps {
  emoji: string;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

/**
 * 소비자 취향유형(C1) 선택 카드. 이모지 + 제목 + 한 줄 설명으로 구성됩니다.
 * 최종 아이콘/일러스트가 정해지면 emoji 자리만 이미지로 바꾸면 됩니다.
 */
export function ConsumerPreferenceCard({
  emoji,
  title,
  description,
  selected,
  onSelect,
}: ConsumerPreferenceCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex min-h-[44px] w-full items-center gap-3 rounded-3xl border-2 p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange ${
        selected
          ? 'border-brand-yellow bg-brand-yellow/15'
          : 'border-transparent bg-white shadow-sm hover:border-brand-yellow/50'
      }`}
    >
      <span
        aria-hidden="true"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-yellow/20 text-2xl"
      >
        {emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-slate-800">{title}</span>
        <span className="block text-xs text-slate-500">{description}</span>
      </span>
      {selected && (
        <span aria-hidden="true" className="shrink-0 text-brand-orange">
          ✓
        </span>
      )}
    </button>
  );
}
