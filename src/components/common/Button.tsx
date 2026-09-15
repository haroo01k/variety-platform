import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'accent';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  /** 지정하면 <Link>로, 없으면 <button>으로 렌더링됩니다. */
  to?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}

const BASE_CLASSES =
  'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green sm:text-base';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-green text-white hover:bg-brand-green-dark',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:border-brand-green hover:text-brand-green-dark',
  accent: 'bg-brand-yellow text-brand-green-dark hover:bg-brand-orange hover:text-white',
};

/**
 * 서비스 전반에서 쓰는 공통 버튼.
 * `to`가 있으면 화면 이동용 링크로, 없으면 일반 버튼으로 동작합니다.
 */
export function Button({
  children,
  variant = 'primary',
  to,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  const classes = `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
