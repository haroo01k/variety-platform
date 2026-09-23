import type { MarketVariety } from '../../types/market';
import { CartIcon } from './icons';
import { findVarietyRecord } from '../../lib/varietyLookup';

interface MarketVarietyCardProps {
  variety: MarketVariety;
}

/**
 * 판매처 화면의 품종 카드.
 * 이 페이지의 핵심 행동은 "판매처로 이동"뿐이라 좋아요·카드 저장·공유는 넣지 않고
 * 이미지 + 품종 유형 배지 + 품종명 + 짧은 설명 + 큰 "판매처 보기" 버튼만 보여줍니다.
 * - isFullCard가 true면 image 자체가 우표 테두리·품종명까지 포함된 완성 디자인이라
 *   그대로 보여주기만 합니다.
 * - 그렇지 않으면(품종별 이미지가 아직 없어 대표 이미지를 재사용하는 경우) 우표 톱니
 *   테두리(index.css의 .stamp-edge)와 품종명 텍스트를 직접 그려서 우표처럼 보이게 합니다.
 * 배지(숙기)·짧은 설명은 이름이 같은 VarietyRecord(추천 결과에서 쓰는 원본 품종 데이터)에서
 * 가져오고, 매칭되는 데이터가 없으면 조용히 생략합니다(임의로 만들어내지 않음).
 */
export function MarketVarietyCard({ variety }: MarketVarietyCardProps) {
  const hasMarketUrl = Boolean(variety.marketUrl && variety.marketUrl !== '#');
  const matched = findVarietyRecord(variety.crop, variety.varietyName);
  const badgeLabel = matched?.maturityStage ? `${matched.maturityStage}종` : null;
  const description = matched?.tasteSummary;

  return (
    <div className="flex w-full flex-col items-center gap-2.5">
      <div className="relative w-full">
        {variety.isFullCard ? (
          <img src={variety.image} alt={variety.varietyName} className="h-auto w-full object-contain" />
        ) : (
          <div className="stamp-edge flex h-[128px] w-full flex-col items-center justify-center gap-1.5 border border-[#F0E9D8] bg-[#FBF8EF] px-2 py-3 text-center shadow-sm sm:h-[140px] sm:gap-2 sm:px-3">
            {variety.image && <img src={variety.image} alt="" className="h-12 w-12 object-contain sm:h-16 sm:w-16" />}
            <span className="text-[11px] font-bold leading-tight text-[#20251F] sm:text-xs">{variety.varietyName}</span>
          </div>
        )}
        {badgeLabel && (
          <span className="absolute left-2 top-2 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#20251F] shadow-sm">
            {badgeLabel}
          </span>
        )}
      </div>

      <div className="w-full text-center">
        <p className="text-sm font-extrabold text-[#20251F] sm:text-base">{variety.varietyName}</p>
        {description && <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 sm:text-sm">{description}</p>}
      </div>

      {hasMarketUrl && (
        <a
          href={variety.marketUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${variety.varietyName} 판매처로 이동`}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-brand-green text-sm font-bold text-white transition-colors hover:bg-brand-green-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
        >
          <CartIcon />
          판매처 보기
        </a>
      )}
    </div>
  );
}
