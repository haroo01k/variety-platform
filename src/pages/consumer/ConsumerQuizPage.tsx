import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { CropCard } from '../../components/common/CropCard';
import { ProgressBar } from '../../components/common/ProgressBar';
import { NavigationButtons } from '../../components/common/NavigationButtons';
import { ConsumerPreferenceCard } from '../../components/consumer/ConsumerPreferenceCard';
import { ConsumerChoiceButton } from '../../components/consumer/ConsumerChoiceButton';
import { CROPS } from '../../data/crops';
import type { CropId } from '../../types/crop';
import type { ConsumerAnswers } from '../../types/consumer';
import type { OrchardHarvestMonthAnswer } from '../../types/farmer';
import {
  ACTIVITY_OPTIONS,
  CONSUMER_HARVEST_MONTH_OPTIONS,
  CONSUMER_STORAGE_OPTIONS,
  FLAVOR_OPTIONS,
  NOVELTY_OPTIONS,
  TASTE_TYPE_OPTIONS,
  TEXTURE_OPTIONS,
} from '../../data/consumerOptions';
import { isOrchardCrop } from '../../data/farmerOptions';
import { getConsumerRecommendation } from '../../lib/consumerScoring';
import { ROUTES } from '../../lib/routes';

type StepId = 'crop' | 'tasteType' | 'activity' | 'flavor' | 'texture' | 'novelty' | 'harvestMonth' | 'storage';

const BASE_STEPS: StepId[] = ['crop', 'tasteType', 'activity', 'flavor', 'texture', 'novelty'];
const ORCHARD_EXTRA_STEPS: StepId[] = ['harvestMonth', 'storage'];

const STEP_TITLE: Record<StepId, string> = {
  crop: '어떤 작물이 궁금하세요?',
  tasteType: '나와 가장 가까운 취향은 무엇인가요?',
  activity: '주로 어떻게 먹고 싶나요?',
  flavor: '어떤 맛이나 특징이 좋나요?',
  texture: '좋아하는 식감은 무엇인가요?',
  novelty: '새로운 색이나 모양도 괜찮나요?',
  harvestMonth: '언제 먹고 싶나요?',
  storage: '보관은 어떻게 하나요?',
};

/**
 * 소비자 취향 테스트 화면.
 * 농업인 화면과 같은 단계형(wizard) 구성으로, 작물 선택도 첫 질문으로 포함합니다.
 * 응답을 모두 마치면 실제 채점 로직(getConsumerRecommendation)으로 추천 결과를 계산합니다.
 * 디자인 리소스(폰트·일러스트 등)는 아직 정해지지 않아 emoji placeholder를 씁니다.
 */
export function ConsumerQuizPage() {
  const navigate = useNavigate();

  const [stepIndex, setStepIndex] = useState(0);
  const [cropId, setCropId] = useState<CropId | null>(null);
  const [tasteType, setTasteType] = useState<string | null>(null);
  const [activity, setActivity] = useState<string | null>(null);
  const [flavor, setFlavor] = useState<string | null>(null);
  const [texture, setTexture] = useState<string | null>(null);
  const [novelty, setNovelty] = useState<string | null>(null);
  const [harvestMonth, setHarvestMonth] = useState<OrchardHarvestMonthAnswer | null>(null);
  const [storage, setStorage] = useState<string | null>(null);

  const isOrchard = cropId ? isOrchardCrop(cropId) : false;
  const steps = useMemo<StepId[]>(
    () => (isOrchard ? [...BASE_STEPS, ...ORCHARD_EXTRA_STEPS] : BASE_STEPS),
    [isOrchard],
  );
  const currentStepId = steps[stepIndex];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stepIndex]);

  const handleSelectCrop = (nextCropId: CropId) => {
    if (cropId !== null && cropId !== nextCropId) {
      // 작물이 바뀌면 작물별 선택지(활용·맛·새로움·과수 질문)는 더 이상 유효하지 않으므로 초기화합니다.
      setActivity(null);
      setFlavor(null);
      setNovelty(null);
      setHarvestMonth(null);
      setStorage(null);
    }
    setCropId(nextCropId);
  };

  const isStepValid = (id: StepId): boolean => {
    switch (id) {
      case 'crop':
        return cropId !== null;
      case 'tasteType':
        return tasteType !== null;
      case 'activity':
        return activity !== null;
      case 'flavor':
        return flavor !== null;
      case 'texture':
        return texture !== null;
      case 'novelty':
        return novelty !== null;
      case 'harvestMonth':
        return harvestMonth !== null;
      case 'storage':
        return storage !== null;
      default:
        return false;
    }
  };

  const handlePrev = () => {
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
      return;
    }
    if (!cropId || !tasteType || !activity || !flavor || !texture || !novelty) return;

    const answers: ConsumerAnswers = {
      cropId,
      tasteType,
      activity,
      flavor,
      texture,
      novelty,
      harvestMonth: isOrchard ? (harvestMonth ?? '6-7') : '6-7',
      storage: isOrchard ? (storage ?? 'eat-now') : 'eat-now',
    };
    const result = getConsumerRecommendation(answers);
    navigate(ROUTES.consumerResult, { state: { cropId, answers, result } });
  };

  const renderStep = () => {
    switch (currentStepId) {
      case 'crop': {
        const firstFour = CROPS.slice(0, 4);
        const last = CROPS[4];
        return (
          <div className="grid grid-cols-2 gap-3" role="list" aria-label="작물 선택">
            {firstFour.map((crop) => (
              <CropCard key={crop.id} crop={crop} selected={cropId === crop.id} onSelect={() => handleSelectCrop(crop.id)} />
            ))}
            {last && (
              <div className="col-span-2 mx-auto w-[calc(50%-6px)]">
                <CropCard crop={last} selected={cropId === last.id} onSelect={() => handleSelectCrop(last.id)} />
              </div>
            )}
          </div>
        );
      }
      case 'tasteType':
        return (
          <div className="flex flex-col gap-2">
            {TASTE_TYPE_OPTIONS.map((option) => (
              <ConsumerPreferenceCard
                key={option.value}
                emoji={option.emoji}
                title={option.label}
                description={option.description}
                selected={tasteType === option.value}
                onSelect={() => setTasteType(option.value)}
              />
            ))}
          </div>
        );
      case 'activity':
        if (!cropId) return null;
        return (
          <div className="flex flex-col gap-2">
            {ACTIVITY_OPTIONS[cropId].map((option) => (
              <ConsumerChoiceButton
                key={option.value}
                label={option.label}
                selected={activity === option.value}
                onSelect={() => setActivity(option.value)}
              />
            ))}
          </div>
        );
      case 'flavor':
        if (!cropId) return null;
        return (
          <div className="flex flex-col gap-2">
            {FLAVOR_OPTIONS[cropId].map((option) => (
              <ConsumerChoiceButton
                key={option.value}
                label={option.label}
                selected={flavor === option.value}
                onSelect={() => setFlavor(option.value)}
              />
            ))}
          </div>
        );
      case 'texture':
        return (
          <div className="flex flex-col gap-2">
            {TEXTURE_OPTIONS.map((option) => (
              <ConsumerChoiceButton
                key={option.value}
                label={option.label}
                selected={texture === option.value}
                onSelect={() => setTexture(option.value)}
              />
            ))}
          </div>
        );
      case 'novelty':
        if (!cropId) return null;
        return (
          <div className="flex flex-col gap-2">
            {NOVELTY_OPTIONS[cropId].map((option) => (
              <ConsumerChoiceButton
                key={option.value}
                label={option.label}
                selected={novelty === option.value}
                onSelect={() => setNovelty(option.value)}
              />
            ))}
          </div>
        );
      case 'harvestMonth':
        return (
          <div className="flex flex-col gap-2">
            {CONSUMER_HARVEST_MONTH_OPTIONS.map((option) => (
              <ConsumerChoiceButton
                key={option.value}
                label={option.label}
                selected={harvestMonth === option.value}
                onSelect={() => setHarvestMonth(option.value)}
              />
            ))}
          </div>
        );
      case 'storage':
        return (
          <div className="flex flex-col gap-2">
            {CONSUMER_STORAGE_OPTIONS.map((option) => (
              <ConsumerChoiceButton
                key={option.value}
                label={option.label}
                selected={storage === option.value}
                onSelect={() => setStorage(option.value)}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const isLastStep = stepIndex === steps.length - 1;

  return (
    <Container className="flex flex-col gap-6 py-8 md:py-12">
      <header>
        <h1 className="text-2xl font-extrabold text-brand-green-dark sm:text-3xl">
          나에게 맞는 신품종을 찾아볼까요?
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          몇 가지만 답하면 취향에 딱 맞는 품종을 알려드려요.
        </p>
      </header>

      <ProgressBar current={stepIndex + 1} total={steps.length} />

      <section className="flex flex-col gap-4 rounded-3xl border-2 border-brand-yellow/30 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">{STEP_TITLE[currentStepId]}</h2>
        {renderStep()}
      </section>

      <NavigationButtons
        showPrev={stepIndex > 0}
        onPrev={handlePrev}
        onNext={handleNext}
        nextDisabled={!isStepValid(currentStepId)}
        nextLabel={isLastStep ? '내 취향 품종 찾기 →' : '다음 →'}
        nextVariant="accent"
      />
    </Container>
  );
}
