import type { FarmerVariety, FarmerVarietyScores } from '../../types/farmer';

interface ScoreListProps {
  variety: FarmerVariety;
}

const SCORE_ROWS: Array<{ key: keyof FarmerVarietyScores; icon: string; label: string }> = [
  { key: 'regionFit', icon: '📍', label: '지역 적합성' },
  { key: 'climateResponse', icon: '☀️', label: '기후 대응성' },
  { key: 'purposeFit', icon: '🌱', label: '재배 목적' },
  { key: 'pestResistance', icon: '🛡️', label: '병해충 특성' },
];

/**
 * 농업인 추천 결과 화면의 점수/관심도 목록.
 */
export function ScoreList({ variety }: ScoreListProps) {
  return (
    <ul className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100">
      {SCORE_ROWS.map((row) => (
        <li key={row.key} className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="flex items-center gap-2 text-slate-600">
            <span aria-hidden="true">{row.icon}</span>
            {row.label}
          </span>
          <span className="font-semibold text-slate-800">{variety.scores[row.key]}점</span>
        </li>
      ))}
      <li className="flex items-center justify-between px-4 py-3 text-sm">
        <span className="flex items-center gap-2 text-slate-600">
          <span aria-hidden="true">👥</span>
          소비자 관심도
        </span>
        <span className="font-semibold text-slate-800">{variety.consumerInterest}</span>
      </li>
    </ul>
  );
}
