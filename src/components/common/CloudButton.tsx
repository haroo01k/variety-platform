import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface CloudButtonProps {
  children: ReactNode;
  /** 앱 안 경로로 이동할 때 */
  to?: string;
  onClick?: () => void;
  className?: string;
}

/** 아래는 평평하고 위는 크고 작은 둥근 봉우리가 이어진 구름 윤곽(viewBox 320×120) */
const CLOUD_PATH =
  'M36 110 H284 A26 26 0 0 0 284 58 A24 24 0 0 0 246 40 A40 40 0 0 0 172 22 A36 36 0 0 0 110 34 A28 28 0 0 0 64 52 A29 29 0 0 0 36 110 Z';

/**
 * 귀여운 구름 모양 버튼(결과 화면의 '다시 하기' 버튼용).
 * SVG 구름(아래 평평, 위 둥근 봉우리) 몸통 가운데에 둥글둥글한 글꼴로 글자를 올립니다.
 */
export function CloudButton({ children, to, onClick, className = '' }: CloudButtonProps) {
  const inner = (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 320 120"
        className="absolute inset-0 h-full w-full [filter:drop-shadow(0_3px_6px_rgba(47,125,69,0.16))]"
      >
        <path
          d={CLOUD_PATH}
          className="fill-white stroke-brand-green/25 transition-colors group-hover:fill-brand-green-light"
          strokeWidth="2"
        />
      </svg>
      {/* 글자는 구름 몸통(봉우리 아래 넓은 부분)의 세로 가운데에 둡니다. 글꼴은 홈 메인 제목과 같은 강원교육튼튼체 */}
      <span className="font-gangwon-power absolute inset-x-0 top-[66%] flex -translate-y-1/2 items-center justify-center gap-1.5 text-xl tracking-tight text-brand-green-dark">
        {children}
      </span>
    </>
  );
  const classes = `group relative mx-auto mt-2 block aspect-[320/120] w-full max-w-[280px] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-green motion-reduce:transition-none ${className}`;

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
