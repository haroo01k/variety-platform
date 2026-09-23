import { Link, useLocation } from 'react-router-dom';
import { Container } from './Container';
import { ROUTES } from '../../lib/routes';

const NAV_ITEMS = [
  { to: ROUTES.home, label: '홈' },
  { to: ROUTES.market, label: '판매처' },
  { to: ROUTES.about, label: 'ABOUT' },
];

/**
 * 모든 화면에 공통으로 보이는 상단 헤더.
 * 로고를 누르면 첫 화면으로 이동합니다.
 */
export function Header() {
  const { pathname } = useLocation();

  return (
    <header className="border-b border-brand-green-light bg-brand-ivory">
      <Container className="flex items-center justify-between gap-2 py-3">
        <Link to={ROUTES.home} className="flex shrink-0 items-center gap-1.5 focus-visible:outline-none">
          <span className="text-xl" aria-hidden="true">
            🌱
          </span>
          <span>
            <span className="block text-[15px] font-extrabold leading-tight text-brand-green-dark">
              기후농사
            </span>
            <span className="block text-[10px] leading-tight text-brand-green-dark/60">
              오늘도, 더 나은 식탁을 위해
            </span>
          </span>
        </Link>

        <nav
          aria-label="주요 메뉴"
          className="flex items-center gap-3 whitespace-nowrap text-[11px] font-semibold sm:gap-5 sm:text-sm"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={
                pathname === item.to
                  ? 'text-brand-green underline decoration-2 underline-offset-4'
                  : 'text-brand-green-dark/70 hover:text-brand-green-dark'
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-brand-green-light px-3 py-1.5 text-[11px] font-semibold text-brand-green-dark sm:inline-flex">
          <span aria-hidden="true">🌱</span>
          함께 키우는 더 나은 내일
        </span>
      </Container>
    </header>
  );
}
