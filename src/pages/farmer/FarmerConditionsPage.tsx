import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { CropCard } from '../../components/common/CropCard';
import { ChoiceButton } from '../../components/common/ChoiceButton';
import { ChoiceChip } from '../../components/common/ChoiceChip';
import { ProgressBar } from '../../components/common/ProgressBar';
import { NavigationButtons } from '../../components/common/NavigationButtons';
import { CROPS } from '../../data/crops';
import type { CropId } from '../../types/crop';
import type {
  FarmerAnswers,
  FieldHarvestTimingAnswer,
  IrrigationAnswer,
  OrchardHarvestMonthAnswer,
  RegionAnswer,
  WinterMinAnswer,
} from '../../types/farmer';
import type { HazardKey } from '../../types/variety';
import {
  CLIMATE_RISK_OPTIONS,
  FIELD_HARVEST_TIMING_OPTIONS,
  IRRIGATION_OPTIONS,
  MANAGEMENT_OPTIONS,
  ORCHARD_HARVEST_MONTH_OPTIONS,
  ORCHARD_LOGISTICS_OPTIONS,
  ORCHARD_REDUCE_WORK_OPTIONS,
  PEST_OPTIONS,
  REGION_OPTIONS,
  USAGE_OPTIONS,
  WINTER_MIN_OPTIONS,
  isOrchardCrop,
} from '../../data/farmerOptions';
import { getFarmerRecommendation } from '../../lib/farmerScoring';
import { toggleMultiSelect } from '../../lib/multiSelect';
import { ROUTES } from '../../lib/routes';

type StepId =
  | 'crop'
  | 'region'
  | 'climate'
  | 'irrigation'
  | 'harvest'
  | 'usage'
  | 'pest'
  | 'management'
  | 'winterMin'
  | 'reduceWork'
  | 'logistics';

const BASE_STEPS: StepId[] = ['crop', 'region', 'climate', 'irrigation', 'harvest', 'usage', 'pest', 'management'];
const ORCHARD_EXTRA_STEPS: StepId[] = ['winterMin', 'reduceWork', 'logistics'];

const STEP_META: Record<StepId, { title: string; hint?: string }> = {
  crop: { title: '어떤 작물을 재배하시나요?' },
  region: { title: '재배 지역은 어디인가요?' },
  climate: { title: '가장 걱정되는 기상위험은 무엇인가요?', hint: '여러 개 선택할 수 있어요' },
  irrigation: { title: '관수 여건은 어떤가요?' },
  harvest: { title: '원하는 수확 시기는 언제인가요?' },
  usage: { title: '주요 판로와 용도는 무엇인가요?', hint: '여러 개 선택할 수 있어요' },
  pest: { title: '특히 우려되는 병해충이나 관리 문제가 있나요?', hint: '여러 개 선택할 수 있어요' },
  management: { title: '가장 줄이고 싶은 관리 부담은 무엇인가요?' },
  winterMin: { title: '최근 5년 겨울 최저기온은 어느 정도였나요?' },
  reduceWork: { title: '줄이고 싶은 작업은 무엇인가요?' },
  logistics: { title: '유통에서 중요한 조건은 무엇인가요?' },
};

/**
 * 농업인 조건 입력 화면.
 * 한 화면에 한 질문만 보여주는 단계형(wizard) 구성이며, 답변을 모두 마치면
 * 실제 채점 로직(getFarmerRecommendation)으로 추천 결과를 계산합니다.
 * 디자인 리소스(폰트·작물 일러스트 등)는 아직 정해지지 않아 emoji placeholder를 씁니다.
 */
export function FarmerConditionsPage() {
  const navigate = useNavigate();

  const [stepIndex, setStepIndex] = useState(0);
  const [cropId, setCropId] = useState<CropId | null>(null);
  const [region, setRegion] = useState<RegionAnswer | null>(null);
  const [climateRisks, setClimateRisks] = useState<string[]>([]);
  const [irrigation, setIrrigation] = useState<IrrigationAnswer | null>(null);
  const [harvestChoice, setHarvestChoice] = useState<string | null>(null);
  const [usages, setUsages] = useState<string[]>([]);
  const [pestConcerns, setPestConcerns] = useState<string[]>([]);
  const [managementPriority, setManagementPriority] = useState<string | null>(null);
  const [winterMin, setWinterMin] = useState<WinterMinAnswer | null>(null);
  const [reduceWork, setReduceWork] = useState<string | null>(null);
  const [logistics, setLogistics] = useState<string | null>(null);

  const isOrchard = cropId ? isOrchardCrop(cropId) : false;
  const steps = useMemo<StepId[]>(
    () => (isOrchard ? [...BASE_STEPS, ...ORCHARD_EXTRA_STEPS] : BASE_STEPS),
    [isOrchard],
  );
  const currentStepId = steps[stepIndex];

  // 다음 단계로 넘어가거나 이전으로 돌아갈 때 화면 맨 위로 스크롤합니다.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stepIndex]);

  const handleSelectCrop = (nextCropId: CropId) => {
    if (cropId !== null && cropId !== nextCropId) {
      // 작물이 바뀌면 작물별 선택지(용도·병해충·관리우선순위·수확시기)는 더 이상 유효하지 않으므로 초기화합니다.
      setUsages([]);
      setPestConcerns([]);
      setManagementPriority(null);
      setHarvestChoice(null);
      setWinterMin(null);
      setReduceWork(null);
      setLogistics(null);
    }
    setCropId(nextCropId);
  };

  const isStepValid = (id: StepId): boolean => {
    switch (id) {
      case 'crop':
        return cropId !== null;
      case 'region':
        return region !== null;
      case 'climate':
        return climateRisks.length > 0;
      case 'irrigation':
        return irrigation !== null;
      case 'harvest':
        return harvestChoice !== null;
      case 'usage':
        return usages.length > 0;
      case 'pest':
        return pestConcerns.length > 0;
      case 'management':
        return managementPriority !== null;
      case 'winterMin':
        return winterMin !== null;
      case 'reduceWork':
        return reduceWork !== null;
      case 'logistics':
        return logistics !== null;
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
    if (!cropId) return;

    const answers: FarmerAnswers = {
      cropId,
      region: region ?? 'other',
      climateRisks: (climateRisks.includes('none') ? [] : climateRisks) as HazardKey[],
      irrigation: irrigation ?? 'sufficient',
      harvestTiming: isOrchard ? 'normal' : ((harvestChoice ?? 'normal') as FieldHarvestTimingAnswer),
      harvestMonth: isOrchard ? ((harvestChoice ?? '6-7') as OrchardHarvestMonthAnswer) : '6-7',
      usages,
      pestConcerns,
      managementPriority: managementPriority ?? 'any',
      winterMin: isOrchard ? (winterMin ?? 'unknown') : 'unknown',
      reduceWork: isOrchard ? (reduceWork ?? 'none') : 'none',
      logistics: isOrchard ? (logistics ?? 'sell-now') : 'sell-now',
    };
    const result = getFarmerRecommendation(answers);
    navigate(ROUTES.farmerAnalyzing, { state: { cropId, answers, result } });
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
      case 'region':
        return (
          <div className="flex flex-col gap-2">
            {REGION_OPTIONS.map((option) => (
              <ChoiceButton
                key={option.value}
                label={option.label}
                selected={region === option.value}
                onSelect={() => setRegion(option.value)}
              />
            ))}
          </div>
        );
      case 'climate':
        return (
          <div className="flex flex-wrap gap-2">
            {CLIMATE_RISK_OPTIONS.map((option) => (
              <ChoiceChip
                key={option.value}
                label={option.label}
                selected={climateRisks.includes(option.value)}
                onToggle={() => setClimateRisks((prev) => toggleMultiSelect(prev, option.value, 'none'))}
              />
            ))}
          </div>
        );
      case 'irrigation':
        return (
          <div className="flex flex-col gap-2">
            {IRRIGATION_OPTIONS.map((option) => (
              <ChoiceButton
                key={option.value}
                label={option.label}
                selected={irrigation === option.value}
                onSelect={() => setIrrigation(option.value)}
              />
            ))}
          </div>
        );
      case 'harvest': {
        const options = isOrchard ? ORCHARD_HARVEST_MONTH_OPTIONS : FIELD_HARVEST_TIMING_OPTIONS;
        return (
          <div className="flex flex-col gap-2">
            {options.map((option) => (
              <ChoiceButton
                key={option.value}
                label={option.label}
                selected={harvestChoice === option.value}
                onSelect={() => setHarvestChoice(option.value)}
              />
            ))}
          </div>
        );
      }
      case 'usage':
        if (!cropId) return null;
        return (
          <div className="flex flex-wrap gap-2">
            {USAGE_OPTIONS[cropId].map((option) => (
              <ChoiceChip
                key={option.value}
                label={option.label}
                selected={usages.includes(option.value)}
                onToggle={() => setUsages((prev) => toggleMultiSelect(prev, option.value))}
              />
            ))}
          </div>
        );
      case 'pest':
        if (!cropId) return null;
        return (
          <div className="flex flex-wrap gap-2">
            {PEST_OPTIONS[cropId].map((option) => (
              <ChoiceChip
                key={option.value}
                label={option.label}
                selected={pestConcerns.includes(option.value)}
                onToggle={() => setPestConcerns((prev) => toggleMultiSelect(prev, option.value, 'none'))}
              />
            ))}
          </div>
        );
      case 'management':
        if (!cropId) return null;
        return (
          <div className="flex flex-col gap-2">
            {MANAGEMENT_OPTIONS[cropId].map((option) => (
              <ChoiceButton
                key={option.value}
                label={option.label}
                selected={managementPriority === option.value}
                onSelect={() => setManagementPriority(option.value)}
              />
            ))}
          </div>
        );
      case 'winterMin':
        return (
          <div className="flex flex-col gap-2">
            {WINTER_MIN_OPTIONS.map((option) => (
              <ChoiceButton
                key={option.value}
                label={option.label}
                selected={winterMin === option.value}
                onSelect={() => setWinterMin(option.value)}
              />
            ))}
          </div>
        );
      case 'reduceWork':
        return (
          <div className="flex flex-col gap-2">
            {ORCHARD_REDUCE_WORK_OPTIONS.map((option) => (
              <ChoiceButton
                key={option.value}
                label={option.label}
                selected={reduceWork === option.value}
                onSelect={() => setReduceWork(option.value)}
              />
            ))}
          </div>
        );
      case 'logistics':
        return (
          <div className="flex flex-col gap-2">
            {ORCHARD_LOGISTICS_OPTIONS.map((option) => (
              <ChoiceButton
                key={option.value}
                label={option.label}
                selected={logistics === option.value}
                onSelect={() => setLogistics(option.value)}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const meta = STEP_META[currentStepId];
  const isLastStep = stepIndex === steps.length - 1;

  return (
    <Container className="flex flex-col gap-6 py-8 md:py-12">
      <header>
        <h1 className="text-2xl font-extrabold text-brand-green-dark sm:text-3xl">
          우리 농장 조건을 알려주세요
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          한 번에 한 질문씩 답해주시면 더 정확한 신품종을 추천해드려요.
        </p>
      </header>

      <ProgressBar current={stepIndex + 1} total={steps.length} />

      <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{meta.title}</h2>
          {meta.hint && <p className="mt-1 text-xs text-slate-400">{meta.hint}</p>}
        </div>

        {renderStep()}
      </section>

      <NavigationButtons
        showPrev={stepIndex > 0}
        onPrev={handlePrev}
        onNext={handleNext}
        nextDisabled={!isStepValid(currentStepId)}
        nextLabel={isLastStep ? '추천 결과 보기 →' : '다음 →'}
      />
    </Container>
  );
}
