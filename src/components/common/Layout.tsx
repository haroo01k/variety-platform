import { Outlet } from 'react-router-dom';
import { Header } from './Header';

/**
 * 모든 라우트에 공통으로 적용되는 레이아웃.
 * Header + 각 화면(Outlet)을 세로로 배치합니다.
 */
export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-ivory text-slate-800">
      <Header />
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
