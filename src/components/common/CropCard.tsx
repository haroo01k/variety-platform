import { PlaceholderImage } from './PlaceholderImage';
import type { Crop } from '../../types/crop';

interface CropCardProps {
  crop: Crop;
  selected: boolean;
  onSelect: () => void;
  className?: string;
}

/**
 * 작물 선택 카드 (탭하면 선택되는 버튼형 카드).
 * crop.imageSrc가 채워지면 실제 이미지로, 없으면 이모지 placeholder로 표시됩니다.
 * 최종 사진/일러스트가 준비되면 각 작물의 imageSrc만 채우면 됩니다(src/data/crops.ts).
 */
export function CropCard({ crop, selected, onSelect, className = '' }: CropCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative flex min-h-[44px] w-full flex-col items-center gap-2 rounded-3xl border-2 p-4 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green ${
        selected
          ? 'border-brand-green bg-brand-green-light'
          : 'border-transparent bg-white shadow-sm hover:border-brand-green/40'
      } ${className}`}
    >
      {selected && (
        <span
          aria-hidden="true"
          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-green text-xs text-white"
        >
          ✓
        </span>
      )}
      {crop.imageSrc ? (
        <img src={crop.imageSrc} alt="" className="h-24 w-24 max-w-full object-contain" />
      ) : (
        <PlaceholderImage emoji={crop.emoji} colorClass={crop.colorClass} className="h-16 w-16 text-3xl" />
      )}
      <span className="text-sm font-semibold text-slate-700">{crop.name}</span>
    </button>
  );
}
