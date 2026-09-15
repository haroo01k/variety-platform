import { Link } from 'react-router-dom';
import { PlaceholderImage } from '../common/PlaceholderImage';
import { consumerRecommendationPath } from '../../lib/routes';
import type { Crop } from '../../types/crop';

interface CropOptionCardProps {
  crop: Crop;
}

/**
 * 소비자 작물 선택 화면의 작물 카드.
 */
export function CropOptionCard({ crop }: CropOptionCardProps) {
  return (
    <Link
      to={consumerRecommendationPath(crop.id)}
      className="flex flex-col items-center gap-2 rounded-3xl bg-white p-4 text-center shadow-sm hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-green"
    >
      <PlaceholderImage emoji={crop.emoji} colorClass={crop.colorClass} className="h-16 w-16 text-3xl" />
      <span className="text-sm font-semibold text-slate-700">{crop.name}</span>
    </Link>
  );
}
