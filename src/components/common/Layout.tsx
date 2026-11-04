import { useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { AppStatusBanner } from './AppStatusBanner';
import { LARGE_TEXT_CLASS, supportsLargeText, useLargeText } from '../../lib/largeText';

/**
 * 모든 라우트에 공통으로 적용되는 레이아웃.
 * Header + 각 화면(Outlet)을 세로로 배치합니다.
 * 큰글씨 설정이 켜져 있으면 <html>에 큰글씨 클래스를 붙입니다. 하단 상세 패널 등 화면 어디에 그려지는
 * 요소든 함께 커지게 하기 위해서이며, 소비자 코너에서는 설정값은 그대로 두고 클래스만 뗍니다.
 */
export function Layout() {
  const { pathname } = useLocation();
  const largeText = useLargeText();
  const applyLargeText = largeText && supportsLargeText(pathname);

  // 화면이 그려지기 전에 적용해 새로고침·페이지 이동 시 글자 크기가 바뀌며 깜빡이지 않게 합니다.
  useLayoutEffect(() => {
    document.documentElement.classList.toggle(LARGE_TEXT_CLASS, applyLargeText);
  }, [applyLargeText]);

  return (
    <div className="flex min-h-screen flex-col bg-brand-ivory text-slate-800">
      <Header />
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
      <AppStatusBanner />
    </div>
  );
}
