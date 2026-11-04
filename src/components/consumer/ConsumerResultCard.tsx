import { useEffect, useState } from 'react';
import { PlaceholderImage } from '../common/PlaceholderImage';
import { LikeButton } from '../common/LikeButton';
import { BookmarkIcon, ShareIcon, CartIcon } from '../common/icons';
import { downloadCardImage, loadCardImageFile, shareCardImage, shareVariety } from '../../lib/share';
import { findShareCardImage } from '../../data/shareCards';
import { addCardToCollection } from '../../lib/cardCollection';
import { findMarketVariety } from '../../lib/varietyLookup';
import type { ConsumerRecommendation } from '../../types/consumer';

interface ConsumerResultCardProps {
  emoji: string;
  recommendation: ConsumerRecommendation;
  /** 추천 순위(1~3) */
  rank: number;
  /** TOP 2·3 카드의 "다시 테스트하기" 동작 */
  onRetake: () => void;
}

const ACTION_BUTTON =
  'flex h-11 flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white transition-colors hover:border-brand-green';

/**
 * 소비자 추천 결과의 "핵심 콘텐츠" 카드. 선택된 순위 1장만 크게 보여줍니다.
 * TOP 1은 품종 포토카드 PNG를 대표 이미지로 보여주고, 북마크(PNG 저장 + 카드 보관함 담기)·공유(같은 PNG 파일)도
 * 같은 파일을 씁니다. TOP 2·3은 우표 이미지로 미리보기만 합니다.
 * "이 품종 자세히 보기"를 누르면 카드가 Y축으로 뒤집혀 맛·식감·향(특징)·활용·추천 레시피 등
 * 실제 데이터 기반 간단 정보와 판매처 보기·돌아가기를 보여줍니다.
 * 좋아요·저장·공유·판매처 보기·자세히 보기는 TOP 1에서만 제공합니다. TOP 2·3은 같은 카드 모양으로 보여주되
 * 이 기능들(버튼과 동작 모두) 대신 "다시 테스트하기"를 안내합니다.
 */
export function ConsumerResultCard({ emoji, recommendation, rank, onRetake }: ConsumerResultCardProps) {
  const isTop1 = rank === 1;
  const [isFlipped, setIsFlipped] = useState(false);
  const { variety, reasons } = recommendation;
  const badgeLabel = variety.maturityStage ? `${variety.maturityStage}종` : null;
  const description = reasons[0] ?? variety.tasteSummary;
  const hasMarketUrl = Boolean(variety.marketUrl && variety.marketUrl !== '#');
  /** 판매처 화면에서 이미 쓰고 있는 같은 품종의 "우표" 이미지(있으면만 재사용). */
  const stampImage = findMarketVariety(variety.cropId, variety.name)?.image;
  /**
   * TOP 1 포토카드 PNG(5개 작물 25개 품종). 화면 대표 이미지·북마크 저장·공유에 같은 파일을 씁니다.
   * TOP 2·3에는 포토카드를 쓰지 않습니다(우표 이미지 미리보기만, 저장·공유·수집 없음).
   */
  const topCard = isTop1 ? findShareCardImage(variety.id) : undefined;
  const [topCardFile, setTopCardFile] = useState<File | null>(null);

  // iOS Safari는 버튼을 누른 직후에만 공유 시트를 열 수 있어, 카드 PNG를 미리 받아 둡니다.
  useEffect(() => {
    if (!topCard) return;
    let cancelled = false;
    loadCardImageFile(topCard.src, topCard.fileName).then((file) => {
      if (!cancelled) setTopCardFile(file);
    });
    return () => {
      cancelled = true;
    };
  }, [topCard]);

  // 버튼 아래 잠시 보여주는 안내(공유 대신 PNG를 내려받았을 때, 먹어보고 싶어요 처리에 실패했을 때)
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 7000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  // 북마크: 포토카드 PNG 저장 + 이 기기의 카드 보관함에 담기(같은 품종은 한 번만)
  const handleBookmark = () => {
    if (!topCard) return;
    downloadCardImage(topCard.src, topCard.fileName);
    const result = addCardToCollection(variety.id);
    if (result === 'added') setNotice('포토카드 이미지를 저장하고 카드 보관함에 담았어요.');
    else if (result === 'exists') setNotice('이미 보관함에 있는 카드예요. 포토카드 이미지는 다시 저장했어요.');
    else setNotice('포토카드 이미지는 저장했지만, 이 브라우저에서는 카드 보관함에 담을 수 없어요.');
  };

  const handleShare = async () => {
    if (!topCard) {
      shareVariety(variety.name);
      return;
    }
    const result = await shareCardImage(variety.name, topCardFile, topCard.src, topCard.fileName);
    if (result === 'downloaded') {
      setNotice('이 기기에서는 이미지 바로 공유가 지원되지 않아 카드 이미지를 내려받았어요. 저장된 이미지를 카카오톡 등에서 직접 보내 주세요.');
    }
  };

  return (
    <div className="flip-card mx-auto w-full max-w-[520px]">
      <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* 앞면: 기존 1순위 상세 카드 */}
        <div className="flip-card-front w-full rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          {topCard ? (
            // TOP 1: 저장·공유되는 포토카드 PNG를 그대로 보여줌(화면에 보이는 카드 = 저장·공유되는 카드)
            <img
              src={topCard.src}
              alt={`${variety.name} 신품종 포토카드`}
              className="mx-auto block h-auto w-full max-w-[340px] object-contain"
            />
          ) : (
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
          )}

          <p className="mt-4 text-center text-xs font-bold text-brand-orange">
            {rank}위 · {variety.cropName}
          </p>
          <h2 className="mt-1 text-center text-2xl font-extrabold text-[#20251F] sm:text-[28px]">{variety.name}</h2>
          <p className="mt-2 text-center text-sm text-slate-500 sm:text-base">{description}</p>

          {!isTop1 ? (
            <div className="mt-5 flex flex-col items-center gap-2">
              <p className="text-xs text-slate-500">이 품종의 카드도 수집하고 싶다면?</p>
              <button
                type="button"
                onClick={onRetake}
                className="min-h-[44px] w-full rounded-2xl border border-slate-200 bg-[#FBF8EF] text-sm font-bold text-brand-green-dark transition-colors hover:border-brand-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
              >
                다시 테스트하기
              </button>
            </div>
          ) : (
            <>
            <div className="mt-5 flex items-center gap-2">
              <LikeButton varietyId={variety.id} compact className="flex-1" onError={setNotice} />
              <button
                type="button"
                aria-label={`${variety.name} 카드 이미지 저장`}
                onClick={handleBookmark}
                className={`${ACTION_BUTTON} text-brand-green`}
              >
                <BookmarkIcon />
              </button>
              <button
                type="button"
                aria-label={`${variety.name} 공유`}
                onClick={handleShare}
                className={`${ACTION_BUTTON} text-slate-600`}
              >
                <ShareIcon />
              </button>
            </div>
            <p role="status" className={notice ? 'mt-2 rounded-2xl bg-[#FBF8EF] px-3 py-2 text-left text-xs text-slate-600' : 'sr-only'}>
              {notice}
            </p>

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
          </>
          )}
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
