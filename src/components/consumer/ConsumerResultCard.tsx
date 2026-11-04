import { useEffect, useState } from 'react';
import { PlaceholderImage } from '../common/PlaceholderImage';
import { LikeButton } from '../common/LikeButton';
import { BookmarkIcon, ShareIcon, CartIcon } from '../common/icons';
import { downloadCardImage, loadCardImageFile, shareCardImage, shareVariety } from '../../lib/share';
import { findShareCardImage } from '../../data/shareCards';
import { findMarketVariety } from '../../lib/varietyLookup';
import type { ConsumerRecommendation } from '../../types/consumer';

interface ConsumerResultCardProps {
  emoji: string;
  recommendation: ConsumerRecommendation;
  /** 추천 순위(1~3) */
  rank: number;
}

const ACTION_BUTTON =
  'flex h-11 flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white transition-colors hover:border-brand-green';

/**
 * 소비자 추천 결과의 "핵심 콘텐츠" 카드. 선택된 순위 1장만 크게 보여주는 용도라
 * 이미지·이름·추천 이유를 충분히 크게 잡고, 좋아요·카드 저장·공유(동일 크기) + 판매처 보기(큰 CTA)로 구성합니다.
 * "이 품종 자세히 보기"를 누르면 카드가 Y축으로 뒤집혀 맛·식감·향(특징)·활용·추천 레시피 등
 * 실제 데이터 기반 간단 정보와 판매처 보기·돌아가기를 보여줍니다.
 * isFlipped는 이 컴포넌트 내부 상태라, 다른 순위로 바꾸면(부모에서 key로 재마운트) 항상 앞면부터 시작합니다.
 */
export function ConsumerResultCard({ emoji, recommendation, rank }: ConsumerResultCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { variety, reasons } = recommendation;
  const badgeLabel = variety.maturityStage ? `${variety.maturityStage}종` : null;
  const description = reasons[0] ?? variety.tasteSummary;
  const hasMarketUrl = Boolean(variety.marketUrl && variety.marketUrl !== '#');
  /** 판매처 화면에서 이미 쓰고 있는 같은 품종의 "우표" 이미지(있으면만 재사용). */
  const stampImage = findMarketVariety(variety.cropId, variety.name)?.image;
  /** 저장·공유용 최종 승인 카드 PNG(현재 사과 5종). 없으면 기존 저장·공유 동작을 그대로 씁니다. */
  const shareCard = findShareCardImage(variety.id);
  const [shareCardFile, setShareCardFile] = useState<File | null>(null);

  // iOS Safari는 버튼을 누른 직후에만 공유 시트를 열 수 있어, 카드 PNG를 미리 받아 둡니다.
  useEffect(() => {
    if (!shareCard) return;
    let cancelled = false;
    loadCardImageFile(shareCard.src, shareCard.fileName).then((file) => {
      if (!cancelled) setShareCardFile(file);
    });
    return () => {
      cancelled = true;
    };
  }, [shareCard]);

  return (
    <div className="flip-card mx-auto w-full max-w-[520px]">
      <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* 앞면: 기존 1순위 상세 카드 */}
        <div className="flip-card-front w-full rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <div className="relative flex h-48 w-full items-center justify-center sm:h-56">
            {stampImage ? (
              <img
                src={stampImage}
                alt={`${variety.name} 우표 이미지`}
                className="h-full w-auto max-w-full object-contain"
              />
            ) : (
              <PlaceholderImage
                emoji={emoji}
                hexColor={variety.characterColorHex}
                className="h-48 w-48 text-7xl sm:h-56 sm:w-56"
                label={`${variety.name} 캐릭터`}
              />
            )}
            {badgeLabel && (
              <span className="absolute left-2 top-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#20251F] shadow-sm">
                {badgeLabel}
              </span>
            )}
          </div>

          <p className="mt-4 text-center text-xs font-bold text-brand-orange">
            {rank}위 · {variety.cropName}
          </p>
          <h2 className="mt-1 text-center text-2xl font-extrabold text-[#20251F] sm:text-[28px]">{variety.name}</h2>
          <p className="mt-2 text-center text-sm text-slate-500 sm:text-base">{description}</p>

          <div className="mt-5 flex items-center gap-2">
            <LikeButton varietyId={variety.id} iconOnly className="flex-1" />
            <button
              type="button"
              aria-label={shareCard ? `${variety.name} 카드 이미지 저장` : `${variety.name} 카드 저장`}
              onClick={shareCard ? () => downloadCardImage(shareCard.src, shareCard.fileName) : undefined}
              className={`${ACTION_BUTTON} text-brand-green`}
            >
              <BookmarkIcon />
            </button>
            <button
              type="button"
              aria-label={`${variety.name} 공유`}
              onClick={() =>
                shareCard
                  ? shareCardImage(variety.name, shareCardFile, shareCard.src, shareCard.fileName)
                  : shareVariety(variety.name)
              }
              className={`${ACTION_BUTTON} text-slate-600`}
            >
              <ShareIcon />
            </button>
          </div>

          {hasMarketUrl && (
            <a
              href={variety.marketUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${variety.name} 판매처로 이동`}
              className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-brand-green-dark text-base font-bold text-white transition-colors hover:bg-brand-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
            >
              <CartIcon />
              판매처 보기
            </a>
          )}

          <button
            type="button"
            onClick={() => setIsFlipped(true)}
            className="mt-2 min-h-[44px] w-full rounded-2xl border border-slate-200 bg-[#FBF8EF] text-sm font-bold text-brand-green-dark transition-colors hover:border-brand-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
          >
            이 품종 자세히 보기
          </button>
        </div>

        {/* 뒷면: 맛·식감·향(특징)·활용 등 실제 데이터 기반 간단 정보 */}
        <div className="flip-card-back flex w-full flex-col gap-3 rounded-3xl bg-[#FBF8EF] p-5 text-left shadow-sm sm:p-6">
          <h2 className="text-center text-2xl font-extrabold text-[#20251F]">{variety.name}</h2>

          <dl className="divide-y divide-[#EFE7D4] overflow-hidden rounded-2xl bg-white text-sm">
            {variety.tasteTags.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2.5">
                <dt className="text-slate-500">맛</dt>
                <dd className="font-semibold text-[#20251F]">{variety.tasteTags.join(' · ')}</dd>
              </div>
            )}
            {variety.textureTags.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2.5">
                <dt className="text-slate-500">식감</dt>
                <dd className="font-semibold text-[#20251F]">{variety.textureTags.join(' · ')}</dd>
              </div>
            )}
            {variety.tasteSummary && (
              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <dt className="shrink-0 text-slate-500">향·특징</dt>
                <dd className="text-right font-semibold text-[#20251F]">{variety.tasteSummary}</dd>
              </div>
            )}
            {variety.activityTags.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2.5">
                <dt className="text-slate-500">활용</dt>
                <dd className="font-semibold text-[#20251F]">{variety.activityTags.join(' · ')}</dd>
              </div>
            )}
            {variety.recipes.length > 0 && (
              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <dt className="shrink-0 text-slate-500">추천 레시피</dt>
                <dd className="text-right font-semibold text-[#20251F]">{variety.recipes.join(' · ')}</dd>
              </div>
            )}
          </dl>

          <div className="mt-auto flex flex-col gap-2 pt-1">
            {hasMarketUrl && (
              <a
                href={variety.marketUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${variety.name} 판매처로 이동`}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-brand-green text-sm font-bold text-white transition-colors hover:bg-brand-green-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
              >
                <CartIcon />
                판매처 보기
              </a>
            )}
            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="min-h-[44px] w-full rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-600 transition-colors hover:border-brand-green hover:text-brand-green-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
            >
              ← 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
