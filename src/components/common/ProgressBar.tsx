interface ProgressBarProps {
  /** 1부터 시작하는 현재 단계 */
  current: number;
  total: number;
}

/**
 * 질문 단계 진행률 표시. "N / 전체" 텍스트와 채워지는 막대를 함께 보여줍니다.
 */
export function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}>
      <div className="flex items-center justify-between text-xs font-semibold text-brand-green">
        <span>
          {current} / {total}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-brand-green-light">
        <div
          className="h-full rounded-full bg-brand-green transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
