import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';
import { ConsumerRankPickerCard } from '../../components/consumer/ConsumerRankPickerCard';
import { ConsumerResultCard } from '../../components/consumer/ConsumerResultCard';
import { CROPS } from '../../data/crops';
import { findTasteType } from '../../data/consumerQuiz';
import { ROUTES } from '../../lib/routes';
import type { ConsumerResult } from '../../types/consumer';

interface LocationState {
  result: ConsumerResult;
}

/**
 * 소비자 취향 테스트 결과 화면.
 * ① 취향 유형 공개 → ② 유형 소개 → ③ 취향 키워드 3개 → ④ 어울리는 신품종 TOP 3 → ⑤ 다시 테스트하기 순서입니다.
 * TOP 3는 선택한 품종 1장을 큰 카드로 보여주고, 나머지 두 품종은 아래 작은 카드로 눌러서 바꿔 볼 수 있습니다.
 */
export function ConsumerResultPage() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [selectedRank, setSelectedRank] = useState(0);

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
  const selected = result.top3[selectedRank] ?? result.top3[0];
  const emojiOf = (cropId: string) => CROPS.find((c) => c.id === cropId)?.emoji ?? '🌱';
  const alternatives = result.top3.map((r, index) => ({ r, index })).filter(({ index }) => index !== selectedRank);

  return (
    <Container className="flex flex-1 flex-col items-center gap-8 py-8 text-center md:py-12">
      <section className="flex w-full max-w-[520px] flex-col items-center gap-3 rounded-3xl border-2 border-brand-yellow/30 bg-white px-5 py-8 shadow-sm motion-safe:animate-[result-card-in_0.3s_ease-out]">
        <p className="text-sm font-bold text-brand-orange">당신의 농산물 취향은?</p>
        <span aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-yellow/20 text-5xl">
          {type.emoji}
        </span>
        <h1 className="text-3xl font-extrabold text-brand-green-dark sm:text-4xl">{type.name}</h1>
        <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{type.description}</p>
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

      <section className="flex w-full max-w-[520px] flex-col items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-green-dark">나에게 어울리는 신품종 TOP 3</h2>
          <p className="mt-1 text-sm text-slate-500">답변과 품종별 맛·식감·활용 특징을 비교해 서로 다른 작물에서 골랐어요.</p>
        </div>

        {!selected ? (
          <p className="w-full rounded-2xl bg-white p-5 text-sm text-slate-500 shadow-sm">추천할 품종을 찾지 못했어요.</p>
        ) : (
          <div className="w-full">
            <div key={selected.variety.id} className="motion-safe:animate-[result-card-in_0.2s_ease-out]">
              <ConsumerResultCard emoji={emojiOf(selected.variety.cropId)} recommendation={selected} rank={selectedRank + 1} />
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
                      onSelect={() => setSelectedRank(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      <Button variant="secondary" to={ROUTES.consumer} className="w-full max-w-sm">
        다시 테스트하기
      </Button>
    </Container>
  );
}
