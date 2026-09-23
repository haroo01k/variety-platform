import { PlaceholderImage } from '../common/PlaceholderImage';
import type { FarmerRecommendation } from '../../types/farmer';
import type { HazardKey } from '../../types/variety';

interface FarmerResultCardProps {
  rank: 1 | 2 | 3;
  emoji: string;
  recommendation: FarmerRecommendation;
  onOpenDetail: () => void;
}

const HAZARD_ITEMS: { key: HazardKey; label: string }[] = [
  { key: 'heat', label: '고온' },
  { key: 'drought', label: '가뭄' },
  { key: 'wet', label: '습해' },
];

/** 0~2점 원점수를 3칸 dot(●●○)으로 시각화합니다. */
function HazardDots({ score }: { score: number }) {
  return (
    <div className="flex gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`h-2.5 w-2.5 rounded-full ${i <= score ? 'bg-brand-green' : 'bg-[#E4DCC8]'}`} />
      ))}
    </div>
  );
}

/**
 * 농업인 추천 결과 전용 카드. TOP 3 중 선택된 순위 1장만 크게 보여주는 용도입니다.
 * 소비자용 카드(맛·감성 중심)와 달리 권장지역·기후 대응력·재배 정보 등 재배 판단에
 * 필요한 정보를 우선 보여주고, 좋아요·공유·판매처 보기 대신 "품종 상세보기"를 메인 액션으로 둡니다.
 */
export function FarmerResultCard({ rank, emoji, recommendation, onOpenDetail }: FarmerResultCardProps) {
  const { variety, totalScore, reasons } = recommendation;
  const statusText = reasons[0] ?? `${variety.regionText} 재배에 참고할 수 있는 품종이에요.`;

  return (
    <div className="mx-auto flex w-full max-w-[520px] flex-col gap-4 rounded-3xl border border-[#F0E9D8] bg-[#FBF8EF] p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
            rank === 1 ? 'bg-brand-green text-white' : 'bg-brand-green-light text-brand-green-dark'
          }`}
        >
          {rank === 1 ? '🏆 추천' : '적합'}
        </span>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-green-dark">
          일치 점수 {totalScore}
        </span>
      </div>

      <PlaceholderImage
        emoji={emoji}
        hexColor={variety.characterColorHex}
        className="mx-auto h-20 w-20 text-4xl"
        label={`${variety.name} 캐릭터`}
      />

      <div className="text-center">
        <h3 className="text-xl font-extrabold text-[#20251F]">{variety.name}</h3>
        <p className="mt-1 text-xs text-slate-500">{statusText}</p>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">권장지역</p>
        <p className="mt-0.5 text-sm font-medium text-[#20251F]">{variety.regionText}</p>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">기후 대응력</p>
        <div className="mt-2 space-y-1.5">
          {HAZARD_ITEMS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>{label}</span>
              <HazardDots score={variety.hazards[key].score} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white/70 p-3 text-xs leading-relaxed text-slate-600">
        <p>
          <span className="font-semibold text-slate-700">용도</span> {variety.usageText}
        </p>
        <p className="mt-1.5">
          <span className="font-semibold text-slate-700">병해충 저항성</span> {variety.pestNote}
        </p>
        <p className="mt-1.5">
          <span className="font-semibold text-slate-700">생육기간</span> {variety.growthPeriodText}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onOpenDetail}
          className="min-h-[44px] flex-1 rounded-full bg-brand-green px-4 text-sm font-bold text-white transition-colors hover:bg-brand-green-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
        >
          품종 상세보기
        </button>
        <button
          type="button"
          className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition-colors hover:border-brand-green hover:text-brand-green-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
        >
          <span aria-hidden="true">🔖</span>
          카드 저장
        </button>
      </div>
    </div>
  );
}
