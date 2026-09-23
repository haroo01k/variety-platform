interface IconProps {
  className?: string;
}

const ICON_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** 카드 저장(북마크) 아이콘. */
export function BookmarkIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg {...ICON_PROPS} className={className} aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/** 공유 아이콘(노드 3개 연결). */
export function ShareIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg {...ICON_PROPS} className={className} aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

/** 판매처 보기(장바구니) 아이콘. */
export function CartIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg {...ICON_PROPS} className={className} aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

/** 목록 항목이 선택 가능함을 알리는 작은 chevron(>) 아이콘. */
export function ChevronRightIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...ICON_PROPS} className={className} aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
