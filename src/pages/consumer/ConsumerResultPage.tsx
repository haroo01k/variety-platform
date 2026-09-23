import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';
import { ConsumerRankPickerCard } from '../../components/consumer/ConsumerRankPickerCard';
import { ConsumerResultCard } from '../../components/consumer/ConsumerResultCard';
import { ConsumerResultMiniCard } from '../../components/consumer/ConsumerResultMiniCard';
import { CROPS } from '../../data/crops';
import { ROUTES } from '../../lib/routes';
import type { ConsumerAnswers, ConsumerResult } from '../../types/consumer';

interface LocationState {
  cropId: string;
  answers: ConsumerAnswers;
  result: ConsumerResult;
}

/**
 * 소비자 추천 결과 화면.
 * 1순위는 기본으로 화면 중앙에 큰 카드로 보이고, 그 아래에는 현재 메인에 없는
 * "나머지 두 추천"만 작은 카드로 뜹니다(현재 선택된 품종은 하단에서 제외 — 중복 표시 방지).
 * 작은 카드를 누르면 페이지 이동 없이 큰 메인 결과 영역만 바뀝니다.
 */
export function ConsumerResultPage() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [selectedRank, setSelectedRank] = useState(0);

  if (!state) {
    return (
      <Container className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
        <p className="text-sm text-slate-500">취향 테스트 응답을 찾을 수 없어요. 다시 시도해주세요.</p>
        <Button to={ROUTES.consumer} variant="primary">
          작물 다시 선택하기
        </Button>
      </Container>
    );
  }

  const { cropId, result } = state;
  const crop = CROPS.find((c) => c.id === cropId) ?? CROPS[0];
  const selected = result.top3[selectedRank] ?? result.top3[0];
  const alternatives = result.top3
    .map((r, index) => ({ r, index }))
    .filter(({ index }) => index !== selectedRank);

  return (
    <Container className="flex flex-1 flex-col items-center gap-6 py-8 text-center md:py-12">
      <header>
        <h1 className="text-2xl font-extrabold text-brand-green-dark sm:text-3xl">당신과 가장 잘 맞는 품종이에요</h1>
      </header>

      {result.isCloseCall && (
        <p className="w-full max-w-[520px] rounded-2xl bg-brand-yellow/20 px-4 py-3 text-sm text-brand-orange">
          상위 품종끼리 취향 일치 정도가 비슷해요. 마음에 드는 쪽으로 골라보세요.
        </p>
      )}

      {!selected ? (
        <p className="w-full max-w-[520px] rounded-2xl bg-white p-5 text-sm text-slate-500 shadow-sm">
          조건에 맞는 품종을 찾지 못했어요.
        </p>
      ) : (
        <div className="w-full max-w-[520px]">
          <div key={selectedRank} className="motion-safe:animate-[result-card-in_0.2s_ease-out]">
            {selectedRank === 0 ? (
              <ConsumerResultCard emoji={crop.emoji} recommendation={selected} />
            ) : (
              <ConsumerResultMiniCard cropId={crop.id} recommendation={selected} />
            )}
          </div>

          {alternatives.length > 0 && (
            <>
              <p className="mt-6 text-sm font-semibold text-slate-500">다른 추천도 살펴보세요</p>
              <p className="mt-1 text-xs text-slate-400">취향에 따라 이런 품종도 잘 맞을 수 있어요.</p>
              <div className="mt-3 grid w-full max-w-full grid-cols-2 gap-3">
                {alternatives.map(({ r, index }) => (
                  <ConsumerRankPickerCard
                    key={r.variety.id}
                    cropId={crop.id}
                    varietyName={r.variety.name}
                    trait={r.reasons[0] ?? r.variety.tasteSummary}
                    onSelect={() => setSelectedRank(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <Button variant="secondary" to={ROUTES.consumer} className="w-full max-w-sm">
        취향 테스트 다시 하기
      </Button>
    </Container>
  );
}
