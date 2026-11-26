interface DemandOrderSwitchProps {
  on: boolean;
  onToggle: () => void;
  /** 비슷한 점수로 보는 점수 차 */
  threshold: number;
  /** 켰을 때 원래보다 자리가 바뀌는 품종 수 */
  movedCount: number;
}

/**
 * 농업인 결과 화면의 "비슷한 점수는 소비자 관심도 순" 스위치. 순위 탭 바로 아래 한 줄로 둡니다. 기본은 꺼짐입니다.
 * 켜도 점수는 바뀌지 않고, 점수 차가 threshold 이내인 품종끼리만 순서가 바뀝니다(src/lib/demandScoring.ts).
 */
export function DemandOrderSwitch({ on, onToggle, threshold, movedCount }: DemandOrderSwitchProps) {
  return (
    <div className="mx-auto -mt-3 w-full max-w-[520px] px-1">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={onToggle}
        className="flex w-full items-center justify-center gap-2.5 rounded-full py-1.5 text-sm font-semibold text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
      >
        <span>
          비슷한 점수는 <span className="text-rose-500">♥</span> 소비자 관심도 순으로
        </span>
        <span
          aria-hidden="true"
          className={`relative inline-block h-6 w-10 shrink-0 rounded-full transition-colors motion-reduce:transition-none ${on ? 'bg-brand-green' : 'bg-slate-300'}`}
        >
          <span
            className={`absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${
              on ? 'translate-x-[18px]' : 'translate-x-0.5'
            }`}
          />
        </span>
      </button>
      {on && (
        <p className="mt-0.5 text-center text-xs text-slate-500" aria-live="polite">
          {movedCount > 0
            ? `점수 차 ${threshold}점 이내 품종 ${movedCount}개의 순서를 바꿨어요. 점수는 그대로예요.`
            : '지금은 바뀌는 순서가 없어요. 소비자 응답이 더 쌓이면 달라질 수 있어요.'}
        </p>
      )}
    </div>
  );
}
