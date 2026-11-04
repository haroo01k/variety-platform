import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';
import { NavigationButtons } from '../../components/common/NavigationButtons';
import { ConsumerAnswerCard } from '../../components/consumer/ConsumerAnswerCard';
import { QUIZ_QUESTIONS } from '../../data/consumerQuiz';
import { getConsumerRecommendation } from '../../lib/consumerScoring';
import { ROUTES } from '../../lib/routes';
import type { ConsumerAnswers, QuizChoice } from '../../types/consumer';

const TOTAL = QUIZ_QUESTIONS.length;
/** 선택한 카드의 색 변화가 보이도록 다음 질문으로 넘어가기 전 잠깐 기다리는 시간(ms) */
const ADVANCE_DELAY = 280;

/**
 * 소비자 농산물 취향 테스트 화면.
 * 시작 화면 → 상황 선택형 A/B 8문항(한 화면에 한 문항) 순서로 진행하고,
 * 선택지를 누르면 자동으로 다음 문항으로 넘어갑니다. 이전 문항으로 돌아가 답을 바꿀 수 있습니다.
 * 취향 유형은 모든 문항에 답한 뒤 결과 화면에서 처음 공개합니다.
 */
export function ConsumerQuizPage() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<ConsumerAnswers>(() => Array(TOTAL).fill(null));
  const [advancing, setAdvancing] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [index, started]);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const finish = (finalAnswers: ConsumerAnswers) => {
    const result = getConsumerRecommendation(finalAnswers);
    navigate(ROUTES.consumerResult, { state: { result } });
  };

  const goNext = (currentAnswers: ConsumerAnswers) => {
    if (index < TOTAL - 1) setIndex(index + 1);
    else finish(currentAnswers);
  };

  const handleSelect = (choice: QuizChoice) => {
    if (advancing) return;
    const next = [...answers];
    next[index] = choice;
    setAnswers(next);
    setAdvancing(true);
    timerRef.current = window.setTimeout(() => {
      setAdvancing(false);
      goNext(next);
    }, ADVANCE_DELAY);
  };

  const handlePrev = () => {
    if (advancing) return;
    if (index === 0) setStarted(false);
    else setIndex(index - 1);
  };

  if (!started) {
    return (
      <Container className="flex flex-col gap-6 py-8 md:py-12">
        <section className="flex flex-col items-center gap-4 rounded-3xl border-2 border-brand-yellow/30 bg-white px-5 py-10 text-center shadow-sm">
          <span aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-yellow/20 text-5xl">
            🧺
          </span>
          <p className="text-sm font-bold text-brand-orange">나의 농산물 취향 발견하기</p>
          <h1 className="text-2xl font-extrabold text-brand-green-dark sm:text-3xl">
            나는 어떤 농산물과
            <br />잘 맞을까요?
          </h1>
          <p className="text-sm text-slate-500 sm:text-base">
            일상 속 상황 {TOTAL}가지에 A·B 중 하나만 골라주세요.
            <br />
            답을 모두 마치면 나의 취향 유형과 어울리는 신품종을 알려드려요.
          </p>
          <Button variant="accent" onClick={() => setStarted(true)} className="mt-2 w-full max-w-xs">
            테스트 시작하기 →
          </Button>
        </section>
      </Container>
    );
  }

  const question = QUIZ_QUESTIONS[index];
  const selected = answers[index];
  const percent = Math.round(((index + 1) / TOTAL) * 100);

  return (
    <Container className="flex flex-col gap-6 py-8 md:py-12">
      <header>
        <p className="text-sm font-bold text-brand-orange">나의 농산물 취향 발견하기</p>
        <div className="mt-3" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={TOTAL}>
          <div className="flex items-center justify-between text-xs font-semibold text-brand-green">
            <span>
              Q{index + 1} / {TOTAL}
            </span>
            <span>{percent}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-brand-green-light">
            <div className="h-full rounded-full bg-brand-green transition-all duration-300" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </header>

      <section
        key={question.id}
        className="flex flex-col gap-5 rounded-3xl border-2 border-brand-yellow/30 bg-white p-5 shadow-sm motion-safe:animate-[result-card-in_0.25s_ease-out] sm:p-6"
      >
        <h2 className="text-xl font-extrabold text-slate-800 sm:text-2xl">
          <span className="mr-1.5 text-brand-orange">Q{index + 1}.</span>
          {question.text}
        </h2>
        <div className="flex flex-col gap-3">
          {(['A', 'B'] as const).map((choice) => (
            <ConsumerAnswerCard
              key={choice}
              label={choice}
              icon={question[choice].icon}
              text={question[choice].text}
              selected={selected === choice}
              disabled={advancing}
              onSelect={() => handleSelect(choice)}
            />
          ))}
        </div>
      </section>

      <NavigationButtons
        showPrev
        onPrev={handlePrev}
        onNext={() => goNext(answers)}
        nextDisabled={selected === null || advancing}
        nextLabel={index === TOTAL - 1 ? '결과 보기 →' : '다음 →'}
        nextVariant="accent"
      />
    </Container>
  );
}
