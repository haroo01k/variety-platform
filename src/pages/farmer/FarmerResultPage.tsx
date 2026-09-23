import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';
import { BottomSheet } from '../../components/common/BottomSheet';
import { ResultRankTabs } from '../../components/common/ResultRankTabs';
import { FarmerResultCard } from '../../components/farmer/FarmerResultCard';
import { FarmerResultDetail } from '../../components/farmer/FarmerResultDetail';
import { ConsumerInterestSection } from '../../components/farmer/ConsumerInterestSection';
import { CROPS } from '../../data/crops';
import { ROUTES } from '../../lib/routes';
import type { FarmerAnswers, FarmerResult } from '../../types/farmer';

interface LocationState {
  cropId: string;
  answers: FarmerAnswers;
  result: FarmerResult;
}

/**
 * 농업인 추천 결과 화면.
 * TOP 3 중 선택된 순위 1장만 큰 카드로 보여주고, 순위 탭을 누르면 같은 자리에서
 * 카드 내용만 바뀝니다(페이지 이동 없음). 기본 선택은 1순위입니다.
 * 카드의 "품종 상세보기"를 누르면 해당 품종의 상세 정보를 바텀시트로 볼 수 있습니다.
 */
export function FarmerResultPage() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [selectedRank, setSelectedRank] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  if (!state) {
    return (
      <Container className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
        <p className="text-sm text-slate-500">입력한 조건을 찾을 수 없어요. 조건을 다시 입력해주세요.</p>
        <Button to={ROUTES.farmerConditions} variant="primary">
          조건 입력하기
        </Button>
      </Container>
    );
  }

  const { cropId, result } = state;
  const crop = CROPS.find((c) => c.id === cropId) ?? CROPS[0];
  const first = result.top3[0];
  const selected = result.top3[selectedRank] ?? first;

  return (
    <Container className="flex flex-col gap-6 py-8 md:py-12">
      <p className="text-sm font-semibold text-brand-green">3 / 3 단계</p>
      <header>
        <h1 className="text-2xl font-extrabold text-brand-green-dark sm:text-3xl">
          선택한 재배 조건을 바탕으로 추천했어요
        </h1>
        <p className="mt-2 text-sm text-slate-500">추천 품종 TOP 3</p>
      </header>

      {result.isCloseCall && (
        <p className="mx-auto w-full max-w-[520px] rounded-2xl bg-brand-yellow/20 px-4 py-3 text-sm text-brand-orange">
          상위 품종끼리 점수 차이가 크지 않아요. 비슷한 조건의 후보로 참고해주세요.
        </p>
      )}

      {!selected ? (
        <p className="mx-auto w-full max-w-[520px] rounded-2xl bg-white p-5 text-sm text-slate-500 shadow-sm">
          조건에 맞는 품종을 찾지 못했어요. 조건을 조금 완화해서 다시 시도해보세요.
        </p>
      ) : (
        <>
          <ResultRankTabs count={result.top3.length} selectedIndex={selectedRank} onSelect={setSelectedRank} />
          <div key={selectedRank} className="motion-safe:animate-[result-card-in_0.2s_ease-out]">
            <FarmerResultCard
              rank={(selectedRank + 1) as 1 | 2 | 3}
              emoji={crop.emoji}
              recommendation={selected}
              onOpenDetail={() => setShowDetail(true)}
            />
          </div>
        </>
      )}

      {first && (
        <ConsumerInterestSection
          cropId={crop.id}
          emoji={crop.emoji}
          farmerTop1Id={first.variety.id}
          farmerTop1Name={first.variety.name}
        />
      )}

      {result.excluded.length > 0 && (
        <div className="rounded-2xl bg-slate-100 p-4 text-xs text-slate-500">
          <p className="font-semibold text-slate-600">추천에서 제외된 품종</p>
          {result.excluded.map(({ variety, reason }) => (
            <p key={variety.id} className="mt-1">
              {variety.name}: {reason}
            </p>
          ))}
        </div>
      )}

      <Button variant="secondary" to={ROUTES.farmerConditions} className="w-full">
        조건 다시 입력하기
      </Button>

      <BottomSheet
        open={showDetail}
        onClose={() => setShowDetail(false)}
        title={selected ? `${selected.variety.name} 상세 정보` : '품종 상세 정보'}
      >
        {selected && <FarmerResultDetail rank={selectedRank + 1} emoji={crop.emoji} recommendation={selected} />}
      </BottomSheet>
    </Container>
  );
}
