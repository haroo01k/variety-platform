import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';
import { ConsumerRankPickerCard } from '../../components/consumer/ConsumerRankPickerCard';
import { ConsumerResultCard } from '../../components/consumer/ConsumerResultCard';
import { InterestRanking } from '../../components/common/InterestRanking';
import { CROPS } from '../../data/crops';
import { findTasteType } from '../../data/consumerQuiz';
import { ROUTES } from '../../lib/routes';
import type { ConsumerResult } from '../../types/consumer';

interface LocationState {
  result: ConsumerResult;
}

/**
 * 소비자 취향 테스트 결과 화면.
 * ① "나의 농산물 취향은?" → ② 취향 유형명 → ③ 한 줄 소개 → ④ 취향 키워드 3개
 * → ⑤ 가운데 큰 품종 카드(기본 TOP 1) + 아래 작은 가로 카드(나머지 순위) → ⑥ 다시 테스트하기
 * → ⑦ 소비자가 주목하는 신품종(전체 이용자 관심도 순위, 보기 전용) 순서입니다.
 * 취향 유형(응답으로 결정)과 추천 품종(추천 알고리즘으로 결정)은 서로 다른 결과라 영역을 나눠 보여줍니다.
 * 작은 카드를 누르면 가운데 카드만 바뀌며, 좋아요·저장·공유·판매처·자세히 보기는 TOP 1을 선택했을 때만 제공합니다.
 */
export function ConsumerResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  /** 가운데에 보여줄 추천 순위의 인덱스(0 = TOP 1) */
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 다시 테스트하기: 응답을 초기화하고 첫 질문부터 시작(좋아요 등 기기에 저장된 기록은 그대로)
  const retake = () => navigate(ROUTES.consumer, { state: { startAtFirstQuestion: true } });

  if (!state?.result) {
    return (
      <Container className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
        <p className="text-sm text-slate-500">취향 테스트 응답을 찾을 수 없어요. 다시 시도해주세요.</p>
        <Button to={ROUTES.consumer} variant="primary">
          취향 테스트 하러 가기
        </Button>
      </Container>
    );
  }

  const { result } = state;
  const type = findTasteType(result.typeId);
  const selected = result.top3[selectedIndex] ?? result.top3[0];
  const emojiOf = (cropId: string) => CROPS.find((c) => c.id === cropId)?.emoji ?? '🌱';
  const alternatives = result.top3.map((r, index) => ({ r, index })).filter(({ index }) => index !== selectedIndex);

  return (
    <Container className="flex flex-1 flex-col items-center gap-8 py-8 text-center md:py-12">
      <section
        aria-label="나의 농산물 취향 유형"
        className="flex w-full max-w-[520px] flex-col items-center gap-3 rounded-3xl border-2 border-brand-yellow/30 bg-white px-5 py-8 shadow-sm motion-safe:animate-[type-reveal_0.6s_ease-out]"
      >
        <p className="text-sm font-bold text-brand-orange">나의 농산물 취향은?</p>
        <span aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-yellow/20 text-5xl">
          {type.emoji}
        </span>
        <h1 className="flex items-center gap-2 text-3xl font-extrabold text-brand-green-dark sm:text-4xl">
          <span aria-hidden="true" className="text-base text-[#F28B9B]">
            ♥
          </span>
          {type.name}
          <span aria-hidden="true" className="text-base text-[#F28B9B]">
            ♥
          </span>
        </h1>
        <p className="text-sm leading-relaxed text-[#5f7f6c] sm:text-base">{type.description}</p>
        {result.keywords.length > 0 && (
          <div className="mt-1 flex flex-col items-center gap-2">
            <p className="text-xs font-semibold text-slate-400">나의 취향 키워드</p>
            <ul className="flex flex-wrap justify-center gap-2">
              {result.keywords.map((keyword) => (
                <li key={keyword} className="rounded-full bg-brand-green-light px-3 py-1.5 text-sm font-bold text-brand-green-dark">
                  {keyword}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-label="나에게 어울리는 신품종" className="flex w-full max-w-[520px] flex-col items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-green-dark">나에게 어울리는 신품종 TOP 3</h2>
          <p className="mt-1 text-sm text-slate-500">답변과 품종별 맛·식감·활용 특징을 비교해 서로 다른 작물에서 골랐어요.</p>
        </div>

        {!selected ? (
          <p className="w-full rounded-2xl bg-white p-5 text-sm text-slate-500 shadow-sm">추천할 품종을 찾지 못했어요.</p>
        ) : (
          <div className="w-full">
            <div
              key={selected.variety.id}
              className={
                selectedIndex === 0
                  ? 'motion-safe:animate-[type-reveal_0.6s_ease-out_0.25s_both]'
                  : 'motion-safe:animate-[result-card-in_0.2s_ease-out]'
              }
            >
              <ConsumerResultCard
                emoji={emojiOf(selected.variety.cropId)}
                recommendation={selected}
                rank={selectedIndex + 1}
                onRetake={retake}
              />
            </div>

            {alternatives.length > 0 && (
              <>
                <p className="mt-6 text-sm font-semibold text-slate-500">다른 추천도 살펴보세요</p>
                <div className="mt-3 grid w-full max-w-full grid-cols-2 gap-3">
                  {alternatives.map(({ r, index }) => (
                    <ConsumerRankPickerCard
                      key={r.variety.id}
                      cropId={r.variety.cropId}
                      varietyName={r.variety.name}
                      trait={`${index + 1}위 · ${r.variety.cropName}`}
                      onSelect={() => setSelectedIndex(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      <Button variant="secondary" onClick={retake} className="w-full max-w-sm">
        다시 테스트하기
      </Button>

      <InterestRanking subtitle="다른 사람들은 어떤 품종을 먹어보고 싶어 할까요?" emptyMessage="아직 집계된 관심도가 없어요." />
    </Container>
  );
}
