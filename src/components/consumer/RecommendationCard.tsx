import { PlaceholderImage } from '../common/PlaceholderImage';
import { Button } from '../common/Button';
import type { ConsumerVariety } from '../../types/consumer';

interface RecommendationCardProps {
  variety: ConsumerVariety;
  cropName: string;
}

/**
 * 소비자 추천 카드 화면의 카드 본체.
 * "먹어보고 싶어요" / "카드 공유하기" 버튼은 이번 단계에서는 실제 동작
 * 없이 자리만 잡아둡니다(공유 API·저장 기능은 이후 단계에서 구현).
 */
export function RecommendationCard({ variety, cropName }: RecommendationCardProps) {
  return (
    <div className="w-full max-w-sm rounded-3xl border-2 border-brand-yellow/50 bg-white p-6 shadow-sm">
      <PlaceholderImage
        emoji={variety.emoji}
        colorClass={variety.colorClass}
        className="mx-auto h-32 w-32 text-6xl"
        label={`${cropName} 캐릭터`}
      />

      <p className="mt-4 inline-block rounded-full bg-brand-yellow/20 px-3 py-1 text-xs font-semibold text-brand-orange">
        {variety.tasteType}
      </p>
      <h2 className="mt-2 text-xl font-extrabold text-slate-800">{variety.varietyName}</h2>
      <p className="mt-2 text-sm text-slate-500">{variety.tasteDescription}</p>

      <div className="mt-4 text-left">
        <p className="text-sm font-semibold text-slate-600">활용 요리</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {variety.dishes.map((dish) => (
            <li key={dish} className="rounded-full bg-brand-green-light px-3 py-1 text-xs text-brand-green-dark">
              {dish}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button variant="accent" className="flex-1">
          먹어보고 싶어요
        </Button>
        <Button variant="secondary" className="flex-1">
          카드 공유하기
        </Button>
      </div>
    </div>
  );
}
