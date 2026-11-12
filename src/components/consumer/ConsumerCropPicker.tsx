import { CropCard } from '../common/CropCard';
import { CROPS } from '../../data/crops';

interface ConsumerCropPickerProps {
  /** 고른 작물 ID 또는 'unsure' */
  value: string | null;
  disabled?: boolean;
  onSelect: (id: string) => void;
}

/** '잘 모르겠어요' 선택지 ID (src/data/consumerQuiz.ts의 작물 선택 질문과 같아야 합니다) */
const UNSURE_ID = 'unsure';

/**
 * 취향 테스트 첫 질문(작물 선택) 화면.
 * 농업인 작물 선택과 같은 작물 일러스트 카드(CropCard)를 쓰고,
 * 마지막 칸에 5개 작물 일러스트를 모은 '잘 모르겠어요' 카드를 둡니다(2열 × 3줄).
 */
export function ConsumerCropPicker({ value, disabled = false, onSelect }: ConsumerCropPickerProps) {
  const unsureSelected = value === UNSURE_ID;
  return (
    <div className="grid grid-cols-2 gap-3" role="list" aria-label="작물 선택">
      {CROPS.map((crop) => (
        <CropCard
          key={crop.id}
          crop={crop}
          selected={value === crop.id}
          onSelect={() => !disabled && onSelect(crop.id)}
        />
      ))}
      <button
        type="button"
        onClick={() => !disabled && onSelect(UNSURE_ID)}
        aria-pressed={unsureSelected}
        className={`relative flex min-h-[44px] w-full flex-col items-center gap-2 rounded-3xl border-2 p-4 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green ${
          unsureSelected
            ? 'border-brand-green bg-brand-green-light'
            : 'border-dashed border-brand-green/40 bg-white shadow-sm hover:border-brand-green/60'
        }`}
      >
        {unsureSelected && (
          <span
            aria-hidden="true"
            className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-green text-xs text-white"
          >
            ✓
          </span>
        )}
        <span aria-hidden="true" className="relative block h-24 w-24 max-w-full">
          {CROPS.map((crop, i) => {
            // 다섯 작물을 원형으로 겹쳐 배치하고 가운데에 물음표를 둡니다.
            const angle = (i / CROPS.length) * 2 * Math.PI - Math.PI / 2;
            const x = 50 + Math.cos(angle) * 32;
            const y = 50 + Math.sin(angle) * 32;
            return crop.imageSrc ? (
              <img
                key={crop.id}
                src={crop.imageSrc}
                alt=""
                className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 object-contain"
                style={{ left: `${x}%`, top: `${y}%` }}
              />
            ) : null;
          })}
          <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-yellow text-base font-extrabold text-white shadow-sm">
            ?
          </span>
        </span>
        <span className="text-sm font-semibold text-slate-700">잘 모르겠어요</span>
      </button>
    </div>
  );
}
