import { VarietyStampImage } from '../common/VarietyStampImage';
import type { FarmerRecommendation } from '../../types/farmer';
import type { HazardKey } from '../../types/variety';
import { getGrowthTraits, getRegionSummary } from '../../lib/varietyTraits';

interface FarmerResultDetailProps {
  rank: number;
  /** 같은 점수의 품종이 있어 공동 순위인지 */
  tied?: boolean;
  emoji: string;
  recommendation: FarmerRecommendation;
}

const HAZARD_ROWS: { key: HazardKey; label: string }[] = [
  { key: 'heat', label: '내고온성' },
  { key: 'drought', label: '내가뭄성' },
  { key: 'wet', label: '내습성' },
];

const HAZARD_SCORE_LABEL: Record<number, string> = { 0: '낮음', 1: '보통', 2: '높음' };

/**
 * 농업인 결과 카드의 "품종 상세보기"를 눌렀을 때 바텀시트에 표시되는 상세 정보.
 * 재배적지·기후 대응력·용도·병해충저항·생육특성(조만성·출하적기·과중·당도)·출처 등 재배 판단에 필요한 항목 중심으로 구성합니다.
 */
export function FarmerResultDetail({ rank, tied = false, emoji, recommendation }: FarmerResultDetailProps) {
  const { variety, totalScore, cautions } = recommendation;
  const growth = getGrowthTraits(variety);
  const regionSummary = getRegionSummary(variety);
  const growthRows: { label: string; value: string | null }[] = [
    { label: '조만성', value: growth.maturity },
    { label: '출하(수확)적기', value: growth.harvest },
    { label: '과중', value: growth.fruitWeight },
    { label: '당도', value: growth.sugar },
    { label: '참고', value: growth.note },
  ];

  return (
    <div>
      <p className="text-xs font-semibold text-slate-400">{tied ? '공동 ' : ''}
        {rank}위 · 일치 점수 {totalScore}</p>
      <div className="mt-2 flex items-center gap-4">
        <VarietyStampImage
          cropId={variety.cropId}
          varietyName={variety.name}
          fallbackEmoji={emoji}
          fallbackHex={variety.characterColorHex}
          className="h-24 w-24 shrink-0"
          label={`${variety.name} 우표 이미지`}
        />
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-slate-800">{variety.name}</h2>
          <p className="text-sm text-slate-500">{regionSummary}</p>
        </div>
      </div>

      <dl className="mt-4 divide-y divide-slate-100 rounded-2xl bg-slate-50 text-sm">
        <div className="px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-slate-500">재배적지</dt>
            <dd className="text-right font-semibold text-slate-700">{regionSummary}</dd>
          </div>
          {regionSummary !== variety.regionText && (
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{variety.regionText}</p>
          )}
        </div>
        {HAZARD_ROWS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between px-3 py-2.5">
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-semibold text-slate-700">
              {HAZARD_SCORE_LABEL[variety.hazards[key].score]} ({variety.hazards[key].score}/2)
            </dd>
          </div>
        ))}
        <div className="flex items-center justify-between px-3 py-2.5">
          <dt className="text-slate-500">용도</dt>
          <dd className="font-semibold text-slate-700">{variety.usageText}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 px-3 py-2.5">
          <dt className="shrink-0 text-slate-500">병해충저항</dt>
          <dd className="text-right font-semibold text-slate-700">{variety.pestNote}</dd>
        </div>
      </dl>

      <p className="mt-4 text-xs font-semibold text-slate-500">생육특성</p>
      <dl className="mt-1.5 divide-y divide-slate-100 rounded-2xl bg-slate-50 text-sm">
        {growthRows
          .filter((row): row is { label: string; value: string } => Boolean(row.value))
          .map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <dt className="shrink-0 text-slate-500">{label}</dt>
              <dd className="text-right font-semibold text-slate-700">{value}</dd>
            </div>
          ))}
      </dl>

      {cautions.length > 0 && (
        <div className="mt-3 rounded-2xl bg-amber-50 p-3">
          {cautions.map((caution, i) => (
            <p key={i} className="text-xs text-amber-800">
              {caution}
            </p>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">출처: {variety.farmerSource}</p>
    </div>
  );
}
