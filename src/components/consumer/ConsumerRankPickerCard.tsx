import { RESULT_EMOJI_IMAGE } from '../../data/resultEmoji';
import { toKoreanOnlyName } from '../../lib/varietyDisplayName';
import { ChevronRightIcon } from '../common/icons';
import type { CropId } from '../../types/crop';

interface ConsumerRankPickerCardProps {
  cropId: CropId;
  varietyName: string;
  trait: string;
  onSelect: () => void;
}

/**
 * 메인 결과 카드 아래에 뜨는 "다른 추천" 선택 카드.
 * 현재 메인에 표시 중인 품종은 부모에서 이미 제외하고 넘겨주므로, 여기서는 순위 표시
 * (1순위/추천 2 등) 없이 작물 이모지 + 품종명 + 한줄 특징 + chevron만 보여줍니다.
 * 눌러도 이 카드가 강조되는 일 없이, 그 품종이 바로 메인 자리로 올라갑니다.
 */
export function ConsumerRankPickerCard({ cropId, varietyName, trait, onSelect }: ConsumerRankPickerCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex min-h-[56px] w-full min-w-0 max-w-full items-center gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:border-brand-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
    >
      <img src={RESULT_EMOJI_IMAGE[cropId]} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold text-[#20251F]">{toKoreanOnlyName(varietyName)}</span>
        <span className="block truncate text-xs text-slate-500">{trait}</span>
      </span>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-400" />
    </button>
  );
}
