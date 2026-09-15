import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * 화면 콘텐츠를 감싸는 공통 컨테이너.
 * 모바일에서는 화면 폭을 그대로 쓰고, 데스크톱에서는 최대 너비를 두고
 * 중앙 정렬합니다.
 */
export function Container({ children, className = '' }: ContainerProps) {
  return <div className={`mx-auto w-full max-w-xl px-4 sm:px-6 ${className}`}>{children}</div>;
}
