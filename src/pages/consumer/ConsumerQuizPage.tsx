import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  // 결과 화면의 "다시 테스트하기"로 들어오면 시작 화면 없이 첫 질문부터 보여줍니다.
  const startAtFirstQuestion = (location.state as { startAtFirstQuestion?: boolean } | null)?.startAtFirstQuestion === true;
  const [started, setStarted] = useState(startAtFirstQuestion);
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
        {/* 시작 화면(강조형): 작은 새싹 장식 + 초록 제목과 연한 노란 밑줄 + 하단 연두색 언덕 */}
        <section className="relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl border border-[#F0E9D8] bg-white px-5 pt-10 pb-24 text-center sm:pb-28">
          <span aria-hidden="true" className="text-2xl">
            🌱
          </span>
          <p className="text-sm font-bold text-brand-orange">나의 농산물 취향 발견하기</p>
          <h1 className="text-xl font-bold leading-snug text-brand-green-dark sm:text-2xl">
            나는 어떤 농산물과
            <br />잘 맞을까요?
          </h1>
          <span aria-hidden="true" className="-mt-1 block h-1.5 w-24 rounded-full bg-brand-yellow/40" />
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            일상 속 상황 {TOTAL}가지에 A·B 중 하나만 골라주세요.
            <br />
            나의 취향 유형과 어울리는 신품종을 알려드려요.
          </p>
          <Button variant="accent" onClick={() => setStarted(true)} className="relative z-10 mt-3 w-full max-w-xs rounded-full">
            테스트 시작하기 →
          </Button>
          <svg
            aria-hidden="true"
            viewBox="0 0 400 80"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full sm:h-24"
          >
            <path d="M0 48 C 70 18, 140 22, 210 44 S 340 66, 400 34 L400 80 L0 80 Z" fill="#E5F0DE" />
            <path d="M0 62 C 90 40, 170 48, 250 62 S 360 70, 400 56 L400 80 L0 80 Z" fill="#D4E8C8" />
          </svg>
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
        className="flex flex-col gap-5 rounded-3xl border border-[#F0E9D8] bg-white p-5 motion-safe:animate-[result-card-in_0.25s_ease-out] sm:p-6"
      >
        <h2 className="text-lg font-semibold leading-snug break-keep text-slate-800 sm:text-xl">
          <span className="mr-1.5 text-brand-orange">Q{index + 1}.</span>
          {question.text}
        </h2>
        {/* 카드형: A/B를 세로형 카드 두 장으로 나란히(아주 좁은 화면에서는 1열) */}
        <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
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
