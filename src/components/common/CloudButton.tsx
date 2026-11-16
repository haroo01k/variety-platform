import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface CloudButtonProps {
  children: ReactNode;
  /** 앱 안 경로로 이동할 때 */
  to?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * 몽글몽글한 구름 모양 버튼(결과 화면의 '다시 하기' 버튼용).
 * 알약 모양 몸통 위에 같은 색 동그라미 3개를 겹쳐 구름 윤곽을 만들고,
 * drop-shadow를 감싸는 요소에 줘서 몸통과 동그라미가 한 덩어리 그림자로 보이게 합니다.
 */
export function CloudButton({ children, to, onClick, className = '' }: CloudButtonProps) {
  const inner = (
    <>
      <span aria-hidden="true" className="absolute -top-3 left-[18%] h-9 w-9 rounded-full bg-white" />
      <span aria-hidden="true" className="absolute -top-5 left-[38%] h-12 w-12 rounded-full bg-white" />
      <span aria-hidden="true" className="absolute -top-3.5 right-[20%] h-10 w-10 rounded-full bg-white" />
      <span className="relative flex min-h-[52px] items-center justify-center gap-1.5 rounded-full bg-white px-6 text-base font-extrabold text-brand-green-dark">
        <span aria-hidden="true">☁️</span>
        {children}
      </span>
    </>
  );
  const classes = `group relative mt-4 block w-full max-w-sm [filter:drop-shadow(0_2px_6px_rgba(47,125,69,0.18))] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-green motion-reduce:transition-none ${className}`;

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
