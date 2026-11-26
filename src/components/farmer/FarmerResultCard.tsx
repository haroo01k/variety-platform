import { VarietyStampImage } from '../common/VarietyStampImage';
import type { FarmerRecommendation } from '../../types/farmer';
import type { HazardKey } from '../../types/variety';
import { getGrowthTraits, getRegionSummary } from '../../lib/varietyTraits';
import { demandLevel } from '../../lib/demandScoring';

interface FarmerResultCardProps {
  rank: 1 | 2 | 3;
  emoji: string;
  recommendation: FarmerRecommendation;
  onOpenDetail: () => void;
  /** 소비자 "먹어보고 싶어요" 누적 수(보기 전용). null이면 아직 모르거나 불러오지 못함 */
  consumerInterest: number | null;
  /** 농업인이 '비슷한 점수는 소비자 관심도 순' 스위치를 켰는지 */
  demandOrderOn?: boolean;
}

const HAZARD_ITEMS: { key: HazardKey; label: string }[] = [
  { key: 'heat', label: '고온' },
  { key: 'drought', label: '가뭄' },
  { key: 'wet', label: '습해' },
];

/** 카드에는 ';' 앞 첫 문장만 짧게 보여주고, 전체 문장은 상세보기에 둡니다. */
function firstClause(text: string): string {
  return text.split(';')[0].trim();
}

/** 0~2점 원점수를 새싹 3칸(🌱🌱·)으로 시각화합니다. 채워지지 않은 칸은 흐린 새싹입니다. */
function HazardDots({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5 text-base leading-none" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span key={i} className={i <= score ? '' : 'opacity-25 grayscale'}>
          🌱
        </span>
      ))}
    </div>
  );
}

const LEVEL_HEARTS: Record<'높음' | '보통' | '낮음', number> = { 높음: 3, 보통: 2, 낮음: 1 };

/** 소비자 관심도를 하트 3칸으로 보여줍니다(기후 대응력의 새싹 3칸과 같은 형식). 집계 전이면 모두 흐리게. */
function HeartDots({ filled }: { filled: number }) {
  return (
    <div className="flex gap-0.5 text-base leading-none" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < filled ? 'text-rose-500' : 'text-rose-200'}>
          {i < filled ? '♥' : '♡'}
        </span>
      ))}
    </div>
  );
}

/**
 * 소비자 관심도 한 줄. 재배적지·기후 대응력 다음에 두어, 재배 판단 정보를 먼저 읽게 합니다.
 * 참고 지표이며 점수에는 반영하지 않습니다(스위치를 켜면 비슷한 점수끼리 순서에만 씀).
 */
function ConsumerDemandRow({
  likes,
  views,
  level,
  orderOn,
}: {
  likes: number;
  views: number;
  level: '높음' | '보통' | '낮음' | null;
  orderOn: boolean;
}) {
  return (
    <div>
      <p className="fs-11 font-semibold uppercase tracking-wide text-slate-400">💌 소비자 관심도</p>
      <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-600">
        <span>
          {level ? (
            <>
              <span className="text-sm font-extrabold text-[#20251F]">{level}</span>
              <span className="ml-1.5">
                본 소비자 {views}명 중 <span className="font-bold text-rose-500">{likes}명</span>이 먹어보고 싶어해요
              </span>
            </>
          ) : (
            <>집계 중 · 아직 본 소비자가 {views}명이에요</>
          )}
        </span>
        <HeartDots filled={level ? LEVEL_HEARTS[level] : 0} />
      </div>
      <p className="mt-1 fs-11 text-slate-400">
        {orderOn ? '비슷한 점수끼리 순서를 정하는 데 쓰고 있어요' : '참고용이에요 · 추천 점수에는 반영하지 않아요'}
      </p>
    </div>
  );
}

/**
 * 농업인 추천 결과 전용 카드. TOP 3 중 선택된 순위 1장만 크게 보여주는 용도입니다.
 * 소비자용 카드(맛·감성 중심)와 달리 재배적지·기후 대응력·재배 정보 등 재배 판단에
 * 필요한 정보를 우선 보여주고, 좋아요·공유·판매처 보기 대신 "품종 상세보기"를 하나뿐인 액션으로 둡니다.
 */
export function FarmerResultCard({
  rank,
  emoji,
  recommendation,
  onOpenDetail,
  consumerInterest,
  demandOrderOn = false,
}: FarmerResultCardProps) {
  const { variety, totalScore, reasons, demand } = recommendation;
  const level = demand ? demandLevel(demand.normalized) : null;
  const statusText = reasons[0] ?? `${getRegionSummary(variety)} 재배에 참고할 수 있는 품종이에요.`;
  const growth = getGrowthTraits(variety);

  return (
    <div className="mx-auto flex w-full max-w-[520px] flex-col gap-4 rounded-3xl border border-[#F0E9D8] bg-[#FBF8EF] p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
            rank === 1 ? 'bg-brand-green text-white' : 'bg-brand-green-light text-brand-green-dark'
          }`}
        >
          {rank === 1 ? '🐝 딱 좋아요' : '적합'}
        </span>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-green-dark">
          일치 점수 {totalScore}
        </span>
      </div>

      <VarietyStampImage
        cropId={variety.cropId}
        varietyName={variety.name}
        fallbackEmoji={emoji}
        fallbackHex={variety.characterColorHex}
        className="mx-auto -my-4 aspect-square w-full max-w-[190px] sm:max-w-[220px]"
        label={`${variety.name} 우표 이미지`}
      />

      <div className="text-center">
        {/* 품종명은 우표 그림 안에 이미 있어 화면에서는 숨기고, 화면 읽기 프로그램용으로만 남깁니다. */}
        <h3 className="sr-only">{variety.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">{statusText}</p>
        {/* 재배 적합도와 별개인 참고 정보(보기 전용, 점수·순위에 반영하지 않음). 값이 없으면 숨깁니다. */}
        {!demand && consumerInterest !== null && consumerInterest > 0 && (
          <p className="mt-1 text-xs text-slate-400">
            소비자 관심 <span className="text-rose-400">♡</span> {consumerInterest}
          </p>
        )}
      </div>

      <div>
        <p className="fs-11 font-semibold uppercase tracking-wide text-slate-400">📍 재배적지</p>
        <p className="mt-0.5 text-sm font-medium text-[#20251F]">{getRegionSummary(variety)}</p>
      </div>

      <div>
        <p className="fs-11 font-semibold uppercase tracking-wide text-slate-400">🌦️ 기후 대응력</p>
        <div className="mt-2 space-y-1.5">
          {HAZARD_ITEMS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>{label}</span>
              <HazardDots score={variety.hazards[key].score} />
            </div>
          ))}
        </div>
      </div>

      {/* 소비자 관심도(참고 지표). 노출 대비 하트율로 계산하며 점수에는 반영하지 않습니다. */}
      {demand && <ConsumerDemandRow likes={demand.likes} views={demand.views} level={level} orderOn={demandOrderOn} />}

      <div className="rounded-2xl bg-white/70 p-3 text-xs leading-relaxed text-slate-600">
        <p>
          <span className="font-semibold text-slate-700">용도</span> {firstClause(variety.usageText)}
        </p>
        <p className="mt-1.5">
          <span className="font-semibold text-slate-700">병해충 저항성</span> {firstClause(variety.pestNote)}
        </p>
        <p className="mt-1.5">
          <span className="font-semibold text-slate-700">조만성</span> {growth.maturity}
          {growth.harvest && (
            <>
              {' · '}
              <span className="font-semibold text-slate-700">출하적기</span> {growth.harvest}
            </>
          )}
        </p>
        {(growth.fruitWeight || growth.sugar) && (
          <p className="mt-1.5">
            {growth.fruitWeight && (
              <>
                <span className="font-semibold text-slate-700">과중</span> {growth.fruitWeight}
              </>
            )}
            {growth.fruitWeight && growth.sugar && ' · '}
            {growth.sugar && (
              <>
                <span className="font-semibold text-slate-700">당도</span> {growth.sugar}
              </>
            )}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onOpenDetail}
          className="min-h-[44px] flex-1 rounded-full bg-brand-green px-4 text-sm font-bold text-white transition-colors hover:bg-brand-green-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
        >
          품종 상세보기
        </button>
      </div>
    </div>
  );
}
