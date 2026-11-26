import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';
import { CuteButton } from '../../components/common/CuteButton';
import { BottomSheet } from '../../components/common/BottomSheet';
import { ResultRankTabs } from '../../components/common/ResultRankTabs';
import { FarmerResultCard } from '../../components/farmer/FarmerResultCard';
import { FarmerResultDetail } from '../../components/farmer/FarmerResultDetail';
import { FarmerNextSteps } from '../../components/farmer/FarmerNextSteps';
import { FarmerOtherVarieties } from '../../components/farmer/FarmerOtherVarieties';
import { InterestRanking } from '../../components/common/InterestRanking';
import { CROPS } from '../../data/crops';
import { getLikeCounts, isSupabaseConfigured } from '../../lib/likes';
import { ROUTES } from '../../lib/routes';
import { DEMAND_NEAR_TIE, displayRanks, reorderNearTiesByDemand } from '../../lib/demandScoring';
import { DemandOrderSwitch } from '../../components/farmer/DemandOrderSwitch';
import type { FarmerAnswers, FarmerResult } from '../../types/farmer';

interface LocationState {
  cropId: string;
  answers: FarmerAnswers;
  result: FarmerResult;
  /** 지역 문항에서 고른 시·군(강원). 없으면 null */
  farmLocation?: { regionName: string } | null;
}

/**
 * 농업인 추천 결과 화면.
 * TOP 3 중 선택된 순위 1장만 큰 카드로 보여주고, 순위 탭을 누르면 같은 자리에서
 * 카드 내용만 바뀝니다(페이지 이동 없음). 기본 선택은 1순위입니다.
 * 카드의 "품종 상세보기"를 누르면 해당 품종의 상세 정보를 바텀시트로 볼 수 있습니다.
 * 하단에는 소비자 "먹어보고 싶어요" 관심도 순위를 보기 전용으로 보여주고, TOP 3 카드에도 각 품종의
 * 소비자 관심 수와 관심도(노출 대비 하트율, 높음·보통·낮음)를 작게 표시합니다. 관심도는 참고 지표로,
 * 재배 적합도 점수·순위에 반영하지 않습니다(src/lib/demandScoring.ts).
 */
export function FarmerResultPage() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [selectedRank, setSelectedRank] = useState(0);
  /** 상세보기 바텀시트에 띄울 품종. 'top'은 선택된 TOP 3 카드, 숫자는 '다른 품종' 목록의 순서 */
  const [detailTarget, setDetailTarget] = useState<'top' | number | null>(null);
  /** 추천 TOP 3 품종의 소비자 관심 수(Supabase 집계). null이면 아직 모르거나 불러오지 못함 */
  const [interestCounts, setInterestCounts] = useState<Record<string, number> | null>(null);
  /** 점수가 비슷한 품종끼리 소비자 관심도 순으로 보기(농업인이 켜는 스위치, 기본 꺼짐) */
  const [demandOrder, setDemandOrder] = useState(false);
  const top3Ids = state?.result.top3.map((r) => r.variety.id).join(',') ?? '';
  const reordered = useMemo(
    () => (state ? reorderNearTiesByDemand(state.result, state.answers.climateRisks) : null),
    [state],
  );

  useEffect(() => {
    if (!isSupabaseConfigured || !top3Ids) return;
    let cancelled = false;
    (async () => {
      const counts = await getLikeCounts(top3Ids.split(','));
      if (!cancelled && counts.ok) setInterestCounts(counts.value);
    })();
    return () => {
      cancelled = true;
    };
  }, [top3Ids]);

  if (!state) {
    return (
      <Container className="font-nanum-round flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
        <p className="text-sm text-slate-500">입력한 조건을 찾을 수 없어요. 조건을 다시 입력해주세요.</p>
        <Button to={ROUTES.farmerConditions} variant="primary">
          조건 입력하기
        </Button>
      </Container>
    );
  }

  const { cropId } = state;
  const hasDemand = state.result.ranked.some((r) => r.demand);
  const result = demandOrder && reordered ? reordered.result : state.result;
  const toggleDemandOrder = () => {
    setDemandOrder((on) => !on);
    setSelectedRank(0);
  };
  const crop = CROPS.find((c) => c.id === cropId) ?? CROPS[0];
  const first = result.top3[0];
  const selected = result.top3[selectedRank] ?? first;
  // 점수가 같으면 같은 순위(공동 순위)로 보여줍니다. 예) 8.1, 8.1, 6.3 → 1, 1, 3
  // 소비자 관심도 순서를 켜면 비슷한 점수끼리 자리가 바뀌므로, 자리 순서 기준으로 매깁니다.
  const allRanks = displayRanks(result.ranked);
  const ranks = allRanks.slice(0, result.top3.length);
  const hasTie = new Set(ranks).size < ranks.length;
  const selectedDisplayRank = ranks[selectedRank] ?? 1;
  const selectedTied = ranks.filter((r) => r === selectedDisplayRank).length > 1;
  // TOP 3 밖의 품종도 전체 순위(공동 순위 포함)로 보여줍니다.
  const others = result.ranked.slice(result.top3.length).map((recommendation, i) => ({
    recommendation,
    rank: allRanks[result.top3.length + i],
  }));
  const detail =
    detailTarget === 'top'
      ? selected
        ? { recommendation: selected, rank: selectedDisplayRank, tied: selectedTied }
        : null
      : detailTarget !== null && others[detailTarget]
        ? {
            recommendation: others[detailTarget].recommendation,
            rank: others[detailTarget].rank,
            tied: result.ranked.filter((o) => o.totalScore === others[detailTarget].recommendation.totalScore).length > 1,
          }
        : null;

  return (
    <Container className="font-nanum-round flex flex-col gap-6 py-8 md:py-12">
      <p className="text-sm font-semibold text-brand-green">3 / 3 단계</p>
      <header>
        <h1 className="text-2xl font-extrabold text-brand-green-dark sm:text-3xl">
          선택한 재배 조건을 바탕으로 추천했어요
        </h1>
        <p className="mt-2 text-sm text-slate-500">추천 품종 TOP 3</p>
      </header>

      {(hasTie || result.isCloseCall) && (
        <p className="mx-auto w-full max-w-[520px] rounded-2xl bg-brand-yellow/20 px-4 py-3 text-sm text-brand-orange">
          {hasTie
            ? demandOrder
              ? '일치 점수가 같은 품종은 공동 순위로 보여드려요. 지금은 소비자 관심도가 높은 품종을 앞에 두었어요.'
              : '일치 점수가 같은 품종은 공동 순위로 보여드려요. 기후 적응성 근거가 더 확실한 품종을 앞에 두었어요.'
            : '상위 품종끼리 점수 차이가 크지 않아요. 비슷한 조건의 후보로 참고해주세요.'}
        </p>
      )}

      {!selected ? (
        <p className="mx-auto w-full max-w-[520px] rounded-2xl bg-white p-5 text-sm text-slate-500 shadow-sm">
          조건에 맞는 품종을 찾지 못했어요. 조건을 조금 완화해서 다시 시도해보세요.
        </p>
      ) : (
        <>
          <ResultRankTabs count={result.top3.length} selectedIndex={selectedRank} onSelect={setSelectedRank} ranks={ranks} />
          {hasDemand && (
            <DemandOrderSwitch
              on={demandOrder}
              onToggle={toggleDemandOrder}
              threshold={DEMAND_NEAR_TIE}
              movedCount={reordered?.movedCount ?? 0}
            />
          )}
          <div key={selectedRank} className="motion-safe:animate-[result-card-in_0.2s_ease-out]">
            <FarmerResultCard
              rank={selectedDisplayRank as 1 | 2 | 3}
              emoji={crop.emoji}
              recommendation={selected}
              demandOrderOn={demandOrder}
              onOpenDetail={() => setDetailTarget('top')}
              consumerInterest={interestCounts?.[selected.variety.id] ?? null}
            />
          </div>
        </>
      )}

      {selected && <FarmerOtherVarieties items={others} onSelect={(i) => setDetailTarget(i)} />}

      {selected && <FarmerNextSteps variety={selected.variety} regionName={state.farmLocation?.regionName ?? null} />}

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

      <p className="mx-auto w-full max-w-[520px] text-center text-xs leading-relaxed text-slate-400">
        추천 결과는 공개된 품종 자료와 입력하신 조건으로 계산한 참고 정보예요.
        <br />
        실제 품종을 고르기 전에 지역 농업기술센터나 종자 판매처와 함께 확인해 주세요.
      </p>

      <CuteButton icon="🧑‍🌾" to={ROUTES.farmerConditions}>
        조건 다시 입력하기
      </CuteButton>

      <InterestRanking
        subtitle="소비자들은 어떤 신품종을 먹어보고 싶어 할까요?"
        emptyMessage="아직 소비자 관심도를 집계하고 있어요."
        footnote="본 순위는 소비자의 먹어보고 싶어요 참여를 기준으로 하며, 실제 판매량이나 구매 수요를 의미하지 않습니다."
      />

      <BottomSheet
        open={detail !== null}
        onClose={() => setDetailTarget(null)}
        title={detail ? `${detail.recommendation.variety.name} 상세 정보` : '품종 상세 정보'}
      >
        {detail && (
          <FarmerResultDetail rank={detail.rank} tied={detail.tied} emoji={crop.emoji} recommendation={detail.recommendation} />
        )}
      </BottomSheet>
    </Container>
  );
}
