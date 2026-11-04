import { Link, useLocation } from 'react-router-dom';
import { Container } from './Container';
import { ROUTES } from '../../lib/routes';
import { setLargeText, supportsLargeText, useLargeText } from '../../lib/largeText';

const NAV_ITEMS = [
  { to: ROUTES.home, label: '홈' },
  { to: ROUTES.market, label: '판매처' },
  { to: ROUTES.about, label: 'ABOUT' },
];

/**
 * 모든 화면에 공통으로 보이는 상단 헤더.
 * 로고를 누르면 첫 화면으로 이동합니다.
 * 오른쪽 '큰글씨' 버튼으로 큰글씨 보기를 켜고 끕니다(소비자 코너에서는 숨김).
 * 헤더 자체(로고·메뉴)는 화면마다 같은 모양을 유지하도록 큰글씨에서도 크기를 바꾸지 않습니다.
 */
export function Header() {
  const { pathname } = useLocation();
  const largeText = useLargeText();

  return (
    <header className="no-text-scale border-b border-brand-green-light bg-brand-ivory">
      {/* 380px 미만에서는 큰글씨 버튼이 들어갈 수 있게 간격을 조금 줄이고, 그래도 좁으면 버튼이 다음 줄 오른쪽으로 내려갑니다. */}
      <Container className="flex flex-wrap items-center justify-between gap-x-1.5 gap-y-2 py-3 min-[380px]:gap-x-2">
        <Link to={ROUTES.home} className="flex shrink-0 items-center gap-1 focus-visible:outline-none min-[380px]:gap-1.5">
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
          className="flex items-center gap-2 whitespace-nowrap text-[11px] font-semibold min-[380px]:gap-3 sm:gap-5 sm:text-sm"
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

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* 헤더 폭이 좁아 장식용 문구와 큰글씨 버튼이 함께 들어가지 않으므로, 버튼이 없는 소비자 코너에서만 문구를 보여줍니다. */}
          {!supportsLargeText(pathname) && (
            <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-brand-green-light px-3 py-1.5 text-[11px] font-semibold text-brand-green-dark sm:inline-flex">
              <span aria-hidden="true">🌱</span>
              함께 키우는 더 나은 내일
            </span>
          )}

          {supportsLargeText(pathname) && (
            <button
              type="button"
              onClick={() => setLargeText(!largeText)}
              aria-pressed={largeText}
              className={`inline-flex min-h-[40px] shrink-0 items-center rounded-full border-2 border-brand-green px-2 text-[12px] font-bold whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green min-[380px]:px-3 sm:px-4 sm:text-sm ${
                largeText ? 'bg-brand-green text-white' : 'bg-white text-brand-green-dark hover:bg-brand-green-light'
              }`}
            >
              큰글씨
            </button>
          )}
        </div>
      </Container>
    </header>
  );
}
