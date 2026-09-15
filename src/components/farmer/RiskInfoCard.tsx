import { PlaceholderImage } from '../common/PlaceholderImage';

interface RiskInfoCardProps {
  emoji: string;
  colorClass: string;
  title: string;
  description: string;
}

/**
 * 분석 화면에서 보여주는 병해충/기후위험 안내 카드.
 */
export function RiskInfoCard({ emoji, colorClass, title, description }: RiskInfoCardProps) {
  return (
    <div className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-sm">
      <PlaceholderImage emoji={emoji} colorClass={colorClass} className="mx-auto h-28 w-28 text-5xl" />
      <p className="mt-4 text-lg font-bold text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
