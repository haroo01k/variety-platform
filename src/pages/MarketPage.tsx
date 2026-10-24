import { useState } from 'react';
import { MarketVarietyCard } from '../components/common/MarketVarietyCard';
import { CROPS } from '../data/crops';
import { MARKET_CROP_DESCRIPTIONS } from '../data/marketCropInfo';
import { MARKET_VARIETIES } from '../data/marketVarieties';
import type { CropId } from '../types/crop';

/**
 * 판매처 화면 (`/market`).
 * 상단은 제목·설명·일러스트가 모두 포함된 투명 배경 배너 이미지 하나로 대체합니다.
 * 그 아래 작물 선택 pill 탭으로 감자·옥수수·복숭아·사과·배추 중 하나를 고르면
 * 해당 작물 품종 5개 카드만 필터링해서 보여줍니다(기본 선택: 감자).
 * 다른 화면과 달리 데스크톱에서 넓게(최대 1200px) 펼쳐지는 전용 레이아웃을 씁니다.
 */
export function MarketPage() {
  const [selectedCrop, setSelectedCrop] = useState<CropId>('potato');

  const selectedCropInfo = CROPS.find((crop) => crop.id === selectedCrop) ?? CROPS[0];
  const filteredVarieties = MARKET_VARIETIES.filter((variety) => variety.crop === selectedCrop);

  return (
    <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      {/*
        투명 배경 일러스트라 카드·배경 없이 페이지 크림색 위에 바로 얹습니다.
        원본 1983×793, 그림 둘레 투명 여백: 위 87 · 아래 19 · 왼쪽 42 · 오른쪽 63px.
        모바일(768px 이하): 화면 좌우 끝까지 쓰고 그림을 117%로 키워, 원본 x 145~1840px 구간을
          보여줍니다. '판매처' 제목·설명(x≈245~)과 가판대·간판(~x≈1765)은 모두 화면 안에 들어오고,
          좌우 맨 끝 풀숲·잎 일부만 가려집니다. (왼쪽 -145/1983 × 117% ≈ -8.55%)
          아래 투명 여백(19/1983 × 117% ≈ 1.12%)은 음수 margin으로 걷어내 작물 버튼과 20~24px 간격을 맞춥니다.
        PC(769px 이상): 최대 1100px로 가운데 정렬하고, 위쪽 투명 여백을 감안해 24px 끌어올립니다.
          시각적 중앙을 맞추려 오른쪽으로 최대 40px 옮기되, 화면 오른쪽 여유가 부족한 폭(약 1180px 이하)에서는
          이동량을 줄여 가로 스크롤이 생기지 않게 합니다(1280px 이상에서 40px).
      */}
      <section className="-mx-4 -mb-[1.12%] overflow-hidden sm:-mx-6 min-[769px]:mx-auto min-[769px]:-mt-6 min-[769px]:mb-0 min-[769px]:max-w-[1100px] min-[769px]:translate-x-[clamp(0px,calc((100vw-1180px)/2),40px)] min-[769px]:overflow-visible">
        <img
          src="/images/market/market-hero-scene.png"
          alt="판매처. 작물별 품종을 선택하고 판매처로 이동해보세요."
          className="-ml-[8.55%] block h-auto w-[117%] max-w-none object-contain min-[769px]:ml-0 min-[769px]:w-full"
        />
      </section>

      <div className="mt-5 flex flex-wrap gap-2 sm:mt-6" role="tablist" aria-label="작물 선택">
        {CROPS.map((crop) => {
          const isSelected = crop.id === selectedCrop;
          return (
            <button
              key={crop.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedCrop(crop.id)}
              className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green ${
                isSelected
                  ? 'border-brand-green bg-brand-green text-white'
                  : 'border-transparent bg-brand-green-light text-[#20251F] hover:border-brand-green'
              }`}
            >
              <span aria-hidden="true">{crop.emoji}</span>
              {crop.name}
            </button>
          );
        })}
      </div>

      <section className="mt-4 sm:mt-6" aria-live="polite">
        <h2 className="text-lg font-extrabold text-[#20251F] sm:text-xl">
          {selectedCropInfo.name} 품종 ({filteredVarieties.length})
        </h2>
        <p className="mt-1 text-sm text-slate-500">{MARKET_CROP_DESCRIPTIONS[selectedCrop]}</p>

        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {filteredVarieties.map((variety) => (
            <MarketVarietyCard key={variety.varietyName} variety={variety} />
          ))}
        </div>
      </section>
    </div>
  );
}
