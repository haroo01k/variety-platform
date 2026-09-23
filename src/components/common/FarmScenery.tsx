interface FarmSceneryProps {
  className?: string;
}

/**
 * 판매처 화면 상단 배너에 쓰는 농촌 풍경 일러스트.
 * 이미지 파일 없이 순수 SVG 도형(하늘·언덕·작은 집)으로 그립니다.
 */
export function FarmScenery({ className = '' }: FarmSceneryProps) {
  return (
    <svg viewBox="0 0 320 180" className={className} role="img" aria-label="언덕과 작은 집이 있는 농촌 풍경">
      <defs>
        <linearGradient id="farm-scenery-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DCEEFB" />
          <stop offset="100%" stopColor="#F3F8EC" />
        </linearGradient>
      </defs>

      <rect width="320" height="180" rx="24" fill="url(#farm-scenery-sky)" />

      <g opacity="0.85" fill="#FFFFFF">
        <circle cx="52" cy="36" r="14" />
        <circle cx="74" cy="42" r="11" />
        <circle cx="30" cy="42" r="9" />
      </g>

      <path d="M0 132 Q 80 96 160 122 T 320 108 V180 H0 Z" fill="#CFE7B0" />
      <path d="M0 156 Q 100 126 200 150 T 320 144 V180 H0 Z" fill="#A9D48A" />

      <g>
        <rect x="214" y="96" width="36" height="30" rx="2" fill="#FDF3E7" />
        <polygon points="208,98 232,76 256,98" fill="#D97757" />
        <rect x="226" y="106" width="10" height="20" fill="#C97B4A" />
        <rect x="240" y="104" width="7" height="7" fill="#BFE0EE" />
      </g>

      <g stroke="#8FBE6E" strokeWidth="3" strokeLinecap="round">
        <path d="M280 150 V128" />
        <path d="M280 132 L270 124" />
        <path d="M280 138 L291 130" />
      </g>
    </svg>
  );
}
