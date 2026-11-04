import { CheckIcon } from '../common/icons';

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
 * 취향 테스트의 A/B 선택지 카드(세로형). 위에 선택지 아이콘, 아래에 선택지 문구를 두고,
 * 선택하면 연한 연두색 배경·초록 테두리와 오른쪽 위 체크 표시로 바뀝니다.
 */
export function ConsumerAnswerCard({ label, icon, text, selected, disabled = false, onSelect }: ConsumerAnswerCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={`relative flex h-full min-h-[168px] w-full flex-col items-center gap-3 rounded-3xl border px-4 pt-6 pb-5 text-center transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green motion-safe:active:scale-[0.98] ${
        selected ? 'border-brand-green bg-brand-green-light' : 'border-slate-200 bg-white hover:border-brand-green/50'
      }`}
    >
      {selected && (
        <span aria-hidden="true" className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-white">
          <CheckIcon className="h-3.5 w-3.5" />
        </span>
      )}
      <span
        aria-hidden="true"
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-3xl ${selected ? 'bg-white' : 'bg-brand-ivory'}`}
      >
        {icon}
      </span>
      <span className="flex flex-col items-center gap-1">
        <span className={`text-xs font-bold ${selected ? 'text-brand-green' : 'text-slate-400'}`}>{label}</span>
        <span className="text-sm font-medium leading-snug break-keep text-slate-800 sm:text-base">{text}</span>
      </span>
    </button>
  );
}
