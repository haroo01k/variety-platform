import { Link } from 'react-router-dom';
import { Container } from './Container';
import { ROUTES } from '../../lib/routes';

/**
 * 모든 화면에 공통으로 보이는 상단 헤더.
 * 로고를 누르면 첫 화면으로 이동합니다.
 */
export function Header() {
  return (
    <header className="border-b border-brand-green-light bg-brand-ivory">
      <Container className="flex items-center justify-between py-3">
        <Link to={ROUTES.home} className="flex items-center gap-2 focus-visible:outline-none">
          <span className="text-2xl" aria-hidden="true">
            🌱
          </span>
          <span>
            <span className="block text-lg font-extrabold leading-tight text-brand-green-dark">
              기후농사
            </span>
            <span className="block text-[11px] leading-tight text-brand-green-dark/60">
              오늘도, 더 나은 식탁을 위해
            </span>
          </span>
        </Link>

        <nav aria-label="주요 메뉴" className="hidden gap-4 text-sm text-brand-green-dark/70 sm:flex">
          <span>작물추천</span>
          <span>기후이야기</span>
          <span>ABOUT</span>
        </nav>
      </Container>
    </header>
  );
}
