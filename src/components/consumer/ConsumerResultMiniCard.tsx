import { Button } from '../common/Button';
import { RESULT_EMOJI_IMAGE } from '../../data/resultEmoji';
import { toKoreanOnlyName } from '../../lib/varietyDisplayName';
import { ROUTES } from '../../lib/routes';
import type { ConsumerRecommendation } from '../../types/consumer';
import type { CropId } from '../../types/crop';

interface ConsumerResultMiniCardProps {
  cropId: CropId;
  recommendation: ConsumerRecommendation;
}

/**
 * 소비자 결과에서 메인이 2·3순위일 때 보여주는 보조 추천 카드.
 * 1순위 카드와 달리 flip이나 상세정보로 연결하지 않고, 작물 마스코트 이미지 +
 * 품종명 + 짧은 설명 + "취향 테스트 다시하기" 유도만 보여주는 가벼운 카드입니다.
 */
export function ConsumerResultMiniCard({ cropId, recommendation }: ConsumerResultMiniCardProps) {
  const { variety, reasons } = recommendation;
  const blurb = reasons[0] ?? variety.tasteSummary;

  return (
    <div className="mx-auto flex w-full max-w-[520px] flex-col items-center gap-3 rounded-3xl bg-white p-6 text-center shadow-sm sm:p-8">
      <img src={RESULT_EMOJI_IMAGE[cropId]} alt="" className="h-40 w-40 object-contain sm:h-48 sm:w-48" />
      <span className="rounded-full bg-brand-green-light px-3 py-1 text-xs font-bold text-brand-green-dark">
        함께 잘 맞는 품종
      </span>
      <h2 className="text-2xl font-extrabold text-[#20251F]">{toKoreanOnlyName(variety.name)}</h2>
      <p className="text-sm text-slate-500 sm:text-base">{blurb}</p>

      <div className="mt-2 w-full rounded-2xl bg-[#FBF8EF] p-4">
        <p className="text-sm font-semibold text-[#20251F]">이 품종도 마음에 드나요?</p>
        <p className="mt-1 text-sm text-slate-500">
          취향 테스트를 다시 해보면 또 다른 추천 결과를 만나볼 수 있어요.
        </p>
        <Button to={ROUTES.consumer} variant="primary" className="mt-3 w-full">
          취향 테스트 다시하기
        </Button>
      </div>
    </div>
  );
}
