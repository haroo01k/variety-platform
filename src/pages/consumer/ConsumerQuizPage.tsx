import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';
import { NavigationButtons } from '../../components/common/NavigationButtons';
import { ConsumerAnswerCard } from '../../components/consumer/ConsumerAnswerCard';
import { ConsumerCropPicker } from '../../components/consumer/ConsumerCropPicker';
import { CROP_PICK_QUESTION } from '../../data/consumerQuiz';
import { estimateTotalQuestions, getConsumerRecommendation, getQuestionSequence, resolveCrop } from '../../lib/consumerScoring';
import { ROUTES } from '../../lib/routes';
import type { ConsumerAnswers } from '../../types/consumer';

/** 선택지 카드 왼쪽 위 라벨 */
const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
/** 선택한 카드의 색 변화가 보이도록 다음 질문으로 넘어가기 전 잠깐 기다리는 시간(ms) */
const ADVANCE_DELAY = 280;

/**
 * 소비자 농산물 취향 테스트 화면.
 * 시작 화면 → 작물 선택 → (잘 모르겠어요면 작물 찾기 2문항) → 작물별 품종 질문 3문항(한 화면에 한 문항) 순서로 진행하고,
 * 선택지를 누르면 자동으로 다음 문항으로 넘어갑니다. 이전 문항으로 돌아가 답을 바꿀 수 있습니다.
 * 취향 유형은 모든 문항에 답한 뒤 결과 화면에서 처음 공개합니다.
 */
/** 시작 화면 작물 친구들(가운데가 크고 높은 아치 배치) */
const INTRO_FRIENDS = [
  { id: 'potato', size: 'h-12 w-12 sm:h-14 sm:w-14', lift: '0px' },
  { id: 'corn', size: 'h-14 w-14 sm:h-16 sm:w-16', lift: '10px' },
  { id: 'apple', size: 'h-16 w-16 sm:h-20 sm:w-20', lift: '18px' },
  { id: 'peach', size: 'h-14 w-14 sm:h-16 sm:w-16', lift: '10px' },
  { id: 'cabbage', size: 'h-12 w-12 sm:h-14 sm:w-14', lift: '0px' },
];

export function ConsumerQuizPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // 결과 화면의 "다시 테스트하기"로 들어오면 시작 화면 없이 첫 질문부터 보여줍니다.
  const startAtFirstQuestion = (location.state as { startAtFirstQuestion?: boolean } | null)?.startAtFirstQuestion === true;
  const [started, setStarted] = useState(startAtFirstQuestion);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<ConsumerAnswers>({});
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

  const sequence = getQuestionSequence(answers);
  // 작물이 정해지기 전에는 예상 질문 수로 진행률을 보여줍니다.
  const total = resolveCrop(answers) ? sequence.length : estimateTotalQuestions(answers);

  const goNext = (currentAnswers: ConsumerAnswers) => {
    const currentSequence = getQuestionSequence(currentAnswers);
    if (index < currentSequence.length - 1) setIndex(index + 1);
    else finish(currentAnswers);
  };

  const handleSelect = (optionId: string) => {
    if (advancing) return;
    const updated: ConsumerAnswers = { ...answers, [sequence[index].id]: optionId };
    // 작물을 바꾸는 등 질문 흐름이 달라지면, 더 이상 나오지 않는 질문의 답은 지웁니다.
    const visible = new Set(getQuestionSequence(updated).map((q) => q.id));
    const next = Object.fromEntries(Object.entries(updated).filter(([id]) => visible.has(id)));
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
      <Container className="font-nanum-round flex flex-col gap-6 py-8 md:py-12">
        {/* 시작 화면: 작물 친구들이 통통 떠 있고 꿀벌이 날아다니는 귀여운 첫 화면 */}
        <section className="relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl border border-[#F0E9D8] bg-gradient-to-b from-[#FFF9E8] to-white px-5 pt-8 pb-28 text-center sm:pb-32">
          {/* 반짝이 장식 */}
          <span aria-hidden="true" className="absolute left-6 top-6 text-lg text-brand-yellow motion-safe:animate-[twinkle_2.4s_ease-in-out_infinite]">✦</span>
          <span aria-hidden="true" className="absolute right-10 top-24 text-sm text-brand-yellow motion-safe:animate-[twinkle_2.4s_ease-in-out_0.8s_infinite]">✦</span>
          <span aria-hidden="true" className="absolute left-10 top-40 text-xs text-[#F28B9B] motion-safe:animate-[twinkle_2.4s_ease-in-out_1.6s_infinite]">♥</span>

          {/* 날아다니는 꿀벌 */}
          <span aria-hidden="true" className="absolute right-5 top-5 text-2xl motion-safe:animate-[bee-fly_4s_ease-in-out_infinite]">🐝</span>

          {/* 작물 친구들: 가운데가 높은 아치 모양으로, 하나씩 다른 박자로 통통 */}
          <div aria-hidden="true" className="flex items-end justify-center gap-1.5 sm:gap-2.5">
            {INTRO_FRIENDS.map((friend, i) => (
              <img
                key={friend.id}
                src={`/images/intro/${friend.id}.webp`}
                alt=""
                className={`rounded-full shadow-sm ring-2 ring-white motion-safe:animate-[soft-bob_2s_ease-in-out_infinite] ${friend.size}`}
                style={{ animationDelay: `${i * 0.25}s`, marginBottom: friend.lift }}
              />
            ))}
          </div>

          {/* 말풍선 */}
          <p className="relative mt-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-brand-green-dark shadow-sm">
            우리 중에 누가 나랑 잘 맞을까? 🤔
            <span aria-hidden="true" className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white" />
          </p>

          <p className="mt-2 rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-bold text-brand-orange">나의 농산물 취향 발견하기</p>
          <h1 className="text-2xl font-extrabold leading-snug text-brand-green-dark sm:text-3xl">
            나는 어떤 농산물과
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">잘 맞을까요?</span>
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0.5 -z-0 h-3 rounded-full bg-brand-yellow/45" />
            </span>
          </h1>

          <ul className="mt-1 flex flex-wrap justify-center gap-1.5 text-xs font-bold text-slate-600">
            <li className="rounded-full bg-white px-2.5 py-1 shadow-sm">⏱ 1분이면 끝</li>
            <li className="rounded-full bg-white px-2.5 py-1 shadow-sm">💬 질문 3~5개</li>
            <li className="rounded-full bg-white px-2.5 py-1 shadow-sm">🎁 나만의 품종 카드</li>
          </ul>

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
          {/* 언덕 위 꽃 */}
          <span aria-hidden="true" className="absolute bottom-7 left-[12%] text-base">🌼</span>
          <span aria-hidden="true" className="absolute bottom-10 left-[30%] text-sm">🌱</span>
          <span aria-hidden="true" className="absolute bottom-6 right-[26%] text-base">🌷</span>
          <span aria-hidden="true" className="absolute bottom-9 right-[10%] text-sm">🌼</span>
        </section>
      </Container>
    );
  }

  const question = sequence[index];
  const selected = answers[question.id] ?? null;
  const percent = Math.round(((index + 1) / total) * 100);

  return (
    <Container className="font-nanum-round flex flex-col gap-6 py-8 md:py-12">
      <header>
        <p className="text-sm font-bold text-brand-orange">나의 농산물 취향 발견하기</p>
        <div className="mt-3" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={total}>
          <div className="flex items-center justify-between text-xs font-semibold text-brand-green">
            <span>
              Q{index + 1} / {total}
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
        <h2 className="text-lg font-extrabold leading-snug break-keep text-slate-800 sm:text-xl">
          <span className="mr-1.5 text-brand-orange">Q{index + 1}.</span>
          {question.text}
        </h2>
        {question.id === CROP_PICK_QUESTION.id ? (
          // 첫 질문(작물 선택)은 농업인 화면과 같은 작물 일러스트 카드로 보여줍니다.
          <ConsumerCropPicker value={selected} disabled={advancing} onSelect={handleSelect} />
        ) : (
          <>
            {/* 카드형: 선택지를 세로형 카드로 나란히(아주 좁은 화면에서는 1열, 선택지가 많으면 작은 카드) */}
            <div className={`grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 ${question.options.length > 4 ? 'sm:grid-cols-3' : ''}`}>
              {question.options.map((option, i) => (
                <ConsumerAnswerCard
                  key={option.id}
                  label={OPTION_LABELS[i] ?? ''}
                  icon={option.icon}
                  text={option.text}
                  selected={selected === option.id}
                  disabled={advancing}
                  compact={question.options.length > 2}
                  onSelect={() => handleSelect(option.id)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <NavigationButtons
        showPrev
        onPrev={handlePrev}
        onNext={() => goNext(answers)}
        nextDisabled={selected === null || advancing}
        nextLabel={resolveCrop(answers) && index === sequence.length - 1 ? '결과 보기 →' : '다음 →'}
        nextVariant="accent"
      />
    </Container>
  );
}
