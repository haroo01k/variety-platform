import type { Crop } from '../../types/crop';

/** 우표 크기(viewBox 단위). 판매처 우표 테두리(index.css .stamp-edge)와 같은 120×135 비율입니다. */
const W = 120;
const H = 135;
/** 톱니(반원) 반지름과 위치 — .stamp-edge 마스크와 같은 배치 */
const R = 5;
const X_BITES = [10, 30, 50, 70, 90, 110];
const Y_BITES = [11, 33, 55, 77, 99, 121];

/**
 * 우표 테두리 경로. 시계 방향(위 → 오른쪽 → 아래 → 왼쪽)으로 돌며 각 변에 안쪽으로 파인 반원 톱니를 넣습니다.
 * 시계 방향이므로 안쪽으로 파이는 반원은 항상 sweep-flag 0입니다.
 */
function buildStampPath(): string {
  const parts = ['M 0 0'];
  X_BITES.forEach((x) => parts.push(`L ${x - R} 0`, `A ${R} ${R} 0 0 0 ${x + R} 0`));
  parts.push(`L ${W} 0`);
  Y_BITES.forEach((y) => parts.push(`L ${W} ${y - R}`, `A ${R} ${R} 0 0 0 ${W} ${y + R}`));
  parts.push(`L ${W} ${H}`);
  [...X_BITES].reverse().forEach((x) => parts.push(`L ${x + R} ${H}`, `A ${R} ${R} 0 0 0 ${x - R} ${H}`));
  parts.push(`L 0 ${H}`);
  [...Y_BITES].reverse().forEach((y) => parts.push(`L 0 ${y + R}`, `A ${R} ${R} 0 0 0 0 ${y - R}`));
  parts.push('Z');
  return parts.join(' ');
}

const STAMP_PATH = buildStampPath();

interface AnalyzingStampProps {
  crop: Crop;
  /** 초록 선이 우표 테두리를 한 바퀴 채우는 데 걸리는 시간(ms) */
  durationMs: number;
}

/**
 * 농업인 분석 화면의 로딩 표시.
 * 작물 그림을 우표 모양에 담고, 초록 선이 우표 톱니 테두리를 따라 구불구불 한 바퀴 채워지며 진행 상황을 보여줍니다.
 * 작물 그림(흰 배경 PNG)은 mix-blend-multiply로 우표 바탕색에 자연스럽게 섞습니다.
 */
export function AnalyzingStamp({ crop, durationMs }: AnalyzingStampProps) {
  return (
    <div className="no-text-scale relative h-[162px] w-[144px]">
      <svg
        viewBox={`-6 -6 ${W + 12} ${H + 12}`}
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        {/* 우표 바탕 + 연한 테두리(아직 채워지지 않은 길) */}
        <path d={STAMP_PATH} fill="#FBF8EF" stroke="#E5F0DE" strokeWidth={3.5} strokeLinejoin="round" />
        {/* 초록 선: pathLength 100 기준으로 dashoffset을 100 → 0으로 줄여 테두리를 따라 채웁니다. */}
        <path
          d={STAMP_PATH}
          fill="none"
          stroke="var(--color-brand-green)"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={100}
          strokeDasharray="100 100"
          style={{ animation: `stamp-draw ${durationMs}ms linear forwards` }}
        />
        {/* 안쪽 점선 액자 */}
        <rect x={12} y={12} width={W - 24} height={H - 24} rx={6} fill="none" stroke="#E8DFC8" strokeDasharray="3 3" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pt-1">
        {crop.imageSrc ? (
          <img src={crop.imageSrc} alt="" className="h-[92px] w-[92px] object-contain mix-blend-multiply" />
        ) : (
          <span aria-hidden="true" className="text-5xl">
            {crop.emoji}
          </span>
        )}
        <span className="text-sm font-extrabold text-brand-green-dark">{crop.name}</span>
      </div>
    </div>
  );
}
