import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface CuteButtonProps {
  children: ReactNode;
  /** 글자 왼쪽 동그라미 안에 넣을 이모지 */
  icon?: string;
  /** 앱 안 경로로 이동할 때 */
  to?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * 결과 화면의 '다시 하기' 버튼용 귀여운 젤리 버튼.
 * 노란 알약 몸통 + 아래쪽 진한 그림자(입체감)로 말랑한 사탕처럼 보이고,
 * 누르면 그림자만큼 쏙 들어갑니다. 왼쪽 흰 동그라미 이모지는 올려두면 살짝 흔들립니다.
 */
export function CuteButton({ children, icon = '🌱', to, onClick, className = '' }: CuteButtonProps) {
  const inner = (
    <>
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm group-hover:motion-safe:animate-[wiggle_0.5s_ease-in-out]"
      >
        {icon}
      </span>
      <span className="font-gangwon-power text-lg text-[#5A3A0A]">{children}</span>
      <span aria-hidden="true" className="text-lg text-[#5A3A0A]/70">
        ↻
      </span>
    </>
  );
  const classes = `group mx-auto mt-2 inline-flex min-h-[56px] items-center gap-2.5 rounded-full border-2 border-[#E9A93A] bg-[#FFD966] py-2 pl-2 pr-5 shadow-[0_5px_0_#E0A12E] transition-all hover:-translate-y-0.5 hover:shadow-[0_7px_0_#E0A12E] active:translate-y-[5px] active:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-green motion-reduce:transition-none ${className}`;

  return to ? (
    <Link to={to} className={classes}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={classes}>
      {inner}
    </button>
  );
}
