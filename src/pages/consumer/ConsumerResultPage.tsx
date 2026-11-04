import { useLocation } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';
import { ConsumerResultCard } from '../../components/consumer/ConsumerResultCard';
import { CROPS } from '../../data/crops';
import { findTasteType } from '../../data/consumerQuiz';
import { toKoreanOnlyName } from '../../lib/varietyDisplayName';
import { ROUTES } from '../../lib/routes';
import type { ConsumerResult } from '../../types/consumer';

interface LocationState {
  result: ConsumerResult;
}

/**
 * 소비자 취향 테스트 결과 화면.
 * ① "나의 농산물 취향은?" → ② 취향 유형명 → ③ 한 줄 소개 → ④ 취향 키워드 3개
 * → ⑤ TOP 1 신품종 포토카드(상세·저장·공유) → ⑥ TOP 2·3 간단 목록 → ⑦ 다시 테스트하기 순서입니다.
 * 취향 유형(응답으로 결정)과 TOP 1 품종(추천 알고리즘으로 결정)은 서로 다른 결과라 영역을 나눠 보여줍니다.
 */
export function ConsumerResultPage() {
  const location = useLocation();
  const state = location.state as LocationState | null;

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
  const [top1, ...others] = result.top3;
  const emojiOf = (cropId: string) => CROPS.find((c) => c.id === cropId)?.emoji ?? '🌱';

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
          <h2 className="text-2xl font-extrabold text-brand-green-dark">나에게 어울리는 TOP 1 신품종</h2>
          <p className="mt-1 text-sm text-slate-500">답변과 품종별 맛·식감·활용 특징을 비교해 골랐어요.</p>
        </div>

        {!top1 ? (
          <p className="w-full rounded-2xl bg-white p-5 text-sm text-slate-500 shadow-sm">추천할 품종을 찾지 못했어요.</p>
        ) : (
          <div className="w-full motion-safe:animate-[type-reveal_0.6s_ease-out_0.25s_both]">
            <ConsumerResultCard emoji={emojiOf(top1.variety.cropId)} recommendation={top1} rank={1} />
          </div>
        )}

        {others.length > 0 && (
          <div className="w-full rounded-3xl bg-white p-5 text-left shadow-sm">
            <p className="text-sm font-bold text-slate-600">함께 어울리는 신품종</p>
            <ol className="mt-3 flex flex-col gap-2">
              {others.map((r, index) => (
                <li key={r.variety.id} className="flex items-center gap-3 rounded-2xl bg-[#FBF8EF] px-4 py-3">
                  <span className="shrink-0 text-sm font-extrabold text-brand-orange">{index + 2}위</span>
                  <span className="min-w-0 flex-1 truncate text-base font-bold text-[#20251F]">{toKoreanOnlyName(r.variety.name)}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-slate-500">다른 품종 카드도 받아 보고 싶다면 테스트를 다시 해 보세요.</p>
          </div>
        )}
      </section>

      <Button variant="secondary" to={ROUTES.consumer} className="w-full max-w-sm">
        다시 테스트하기
      </Button>
    </Container>
  );
}
