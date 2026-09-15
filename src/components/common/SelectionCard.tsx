import { Link } from 'react-router-dom';

interface SelectionCardProps {
  to: string;
  icon: string;
  title: string;
  description: string;
}

/**
 * 첫 화면에서 "농업인이세요?" / "소비자세요?"처럼 사용자의 경로를
 * 선택하게 하는 큰 카드형 링크.
 * <Link>는 기본적으로 <a> 태그로 렌더링되어 Tab/Enter로 접근 가능합니다.
 */
export function SelectionCard({ to, icon, title, description }: SelectionCardProps) {
  return (
    <Link
      to={to}
      className="flex flex-1 flex-col items-start gap-3 rounded-3xl border-2 border-transparent bg-white p-6 text-left shadow-sm hover:border-brand-green focus-visible:border-brand-green focus-visible:outline-none"
    >
      <span
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green-light text-3xl"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="text-xl font-bold text-slate-800">{title}</span>
      <span className="text-sm text-slate-500">{description}</span>
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-brand-green">
        시작하기 <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
