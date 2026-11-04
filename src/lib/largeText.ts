/**
 * 큰글씨 보기 설정(켜짐/꺼짐).
 * 이 기기의 localStorage에 저장해 페이지 이동·새로고침 후에도 유지하고,
 * 같은 화면의 여러 컴포넌트(헤더 버튼, 레이아웃)가 같은 값을 보도록 구독 방식으로 공유합니다.
 * 실제 글자 확대는 Layout이 <html>에 LARGE_TEXT_CLASS를 붙여서 적용합니다(src/index.css).
 */
import { useSyncExternalStore } from 'react';
import { ROUTES } from './routes';

export const LARGE_TEXT_CLASS = 'large-text';

/** 처음 재배지역 화면에서만 쓰던 저장 키를 그대로 재사용합니다. */
const STORAGE_KEY = 'farmer-large-text';

function readStored(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
}

let enabled = readStored();
const listeners = new Set<() => void>();

export function setLargeText(next: boolean) {
  enabled = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
  } catch {
    // 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 지금 열린 동안만 적용합니다.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLargeText(): boolean {
  return useSyncExternalStore(subscribe, () => enabled);
}

/** 소비자 코너(취향 테스트·결과·카드)는 큰글씨를 적용하지 않고 기존 글씨 크기를 유지합니다. */
export function supportsLargeText(pathname: string): boolean {
  return !pathname.startsWith(ROUTES.consumer);
}
