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
  OrchardHarvestMonthAnswer,
  PotatoHarvestTiming,
  RegionAnswer,
  WinterMinAnswer,
} from '../../types/farmer';
import type { CropSeason, HazardKey } from '../../types/variety';
import {
  CLIMATE_RISK_OPTIONS,
  CORN_HARVEST_HINT,
  CORN_HARVEST_TIMING_OPTIONS,
  SEASON_CALENDAR,
  POTATO_HARVEST_OPTIONS,
  findSeason,
  isMonthTimingCrop,
  ORCHARD_HARVEST_MONTH_OPTIONS,
  ORCHARD_REDUCE_WORK_OPTIONS,
  PEST_OPTIONS,
  TASTE_OPTIONS,
  USAGE_OPTIONS,
  WINTER_MIN_OPTIONS,
  isOrchardCrop,
} from '../../data/farmerOptions';
import { RegionSelectStep } from '../../components/farmer/RegionSelectStep';
import type { RegionStepValue } from '../../components/farmer/RegionSelectStep';
import { findGangwonRegion } from '../../data/gangwonRegions';
import { isRegionSelectionComplete, resolveRegionAnswer } from '../../lib/farmRegion';
import { getFarmerRecommendation } from '../../lib/farmerScoring';
import { toggleMultiSelect } from '../../lib/multiSelect';
import { ROUTES } from '../../lib/routes';

type StepId =
  | 'crop'
  | 'region'
  | 'climate'
  | 'season'
  | 'harvest'
  | 'taste'
  | 'usage'
  | 'pest'
  | 'winterMin'
  | 'reduceWork';

/** 밭작물(감자·옥수수·배추): 식미 문항 포함. 하나의 개념은 한 문항에서만 묻습니다(2026-11 재구성). */
const FIELD_STEPS: StepId[] = ['crop', 'region', 'climate', 'harvest', 'taste', 'usage', 'pest'];
/** 감자·배추: 작형을 묻습니다. 감자만 수확 달을 선택으로 더 받습니다(배추는 작형으로 품종이 갈림). */
const MONTH_TIMING_STEPS: StepId[] = ['crop', 'region', 'climate', 'season', 'taste', 'usage', 'pest'];
/** 과수(사과·복숭아): 겨울 최저기온·줄이고 싶은 작업 포함, 유통 조건은 판로·용도에 합침 */
const ORCHARD_STEPS: StepId[] = ['crop', 'region', 'climate', 'harvest', 'winterMin', 'usage', 'pest', 'reduceWork'];

const STEP_META: Record<StepId, { title: string; hint?: string }> = {
  crop: { title: '어떤 작물을 재배하시나요?' },
  region: { title: '어느 지역에서 재배하시나요?', hint: '지역명 첫 글자를 누르거나 직접 검색해 주세요.' },
  climate: { title: '가장 걱정되는 기상위험은 무엇인가요?', hint: '여러 개 선택할 수 있어요' },
  season: { title: '언제 심어서 키우는 걸 선호하시나요?' },
  harvest: { title: '원하는 수확 시기는 언제인가요?' },
  taste: { title: '원하는 맛·식감은 무엇인가요?', hint: '여러 개 선택할 수 있어요' },
  usage: { title: '주요 생산 목적과 판로는 무엇인가요?', hint: '여러 개 선택할 수 있어요' },
  pest: { title: '특히 걱정되는 병해충이나 생리장해가 있나요?', hint: '여러 개 선택할 수 있어요' },
  winterMin: { title: '최근 5년 겨울 최저기온은 어느 정도였나요?' },
  reduceWork: { title: '가장 줄이고 싶은 작업은 무엇인가요?' },
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
  const [regionStep, setRegionStep] = useState<RegionStepValue>({
    gangwonRegionId: null,
    regionGroup: null,
    isHighland: null,
  });
  const regionSelection = {
    gangwonRegion: findGangwonRegion(regionStep.gangwonRegionId),
    regionGroup: regionStep.regionGroup,
    isHighland: regionStep.isHighland,
  };
  const region: RegionAnswer | null = resolveRegionAnswer(regionSelection);
  const [climateRisks, setClimateRisks] = useState<string[]>([]);
  const [cropSeason, setCropSeason] = useState<CropSeason | null>(null);
  const [harvestChoice, setHarvestChoice] = useState<string | null>(null);
  const [usages, setUsages] = useState<string[]>([]);
  const [pestConcerns, setPestConcerns] = useState<string[]>([]);
  const [tastes, setTastes] = useState<string[]>([]);
  const [winterMin, setWinterMin] = useState<WinterMinAnswer | null>(null);
  const [reduceWork, setReduceWork] = useState<string | null>(null);

  const isOrchard = cropId ? isOrchardCrop(cropId) : false;
  const steps = useMemo<StepId[]>(
    () => (isOrchard ? ORCHARD_STEPS : cropId && isMonthTimingCrop(cropId) ? MONTH_TIMING_STEPS : FIELD_STEPS),
    [isOrchard, cropId],
  );
  const currentStepId = steps[stepIndex];

  // 다음 단계로 넘어가거나 이전으로 돌아갈 때 화면 맨 위로 스크롤합니다.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stepIndex]);

  const handleSelectCrop = (nextCropId: CropId) => {
    if (cropId !== null && cropId !== nextCropId) {
      // 작물이 바뀌면 작물별 선택지(수확시기·식미·용도·병해충 등)는 더 이상 유효하지 않으므로 초기화합니다.
      setUsages([]);
      setPestConcerns([]);
      setTastes([]);
      setHarvestChoice(null);
      setCropSeason(null);
      setWinterMin(null);
      setReduceWork(null);
    }
    setCropId(nextCropId);
  };

  const isStepValid = (id: StepId): boolean => {
    switch (id) {
      case 'crop':
        return cropId !== null;
      case 'region':
        return isRegionSelectionComplete(regionSelection);
      case 'climate':
        return climateRisks.length > 0;
      case 'harvest':
        return harvestChoice !== null;
      case 'season':
        return cropSeason !== null;
      case 'usage':
        return usages.length > 0;
      case 'pest':
        return pestConcerns.length > 0;
      case 'taste':
        return tastes.length > 0;
      case 'winterMin':
        return winterMin !== null;
      case 'reduceWork':
        return reduceWork !== null;
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
      harvestTiming: cropId === 'corn' ? ((harvestChoice ?? 'any') as FieldHarvestTimingAnswer) : 'any',
      cropSeason: isMonthTimingCrop(cropId) ? cropSeason : null,
      potatoHarvestTiming: cropId === 'potato' && harvestChoice ? (harvestChoice as PotatoHarvestTiming) : null,
      tastes: isOrchard ? [] : tastes.filter((t) => t !== 'any'),
      harvestMonth: isOrchard ? ((harvestChoice ?? '6-7') as OrchardHarvestMonthAnswer) : '6-7',
      usages,
      pestConcerns,
      winterMin: isOrchard ? (winterMin ?? 'unknown') : 'unknown',
      reduceWork: isOrchard ? (reduceWork ?? 'none') : 'none',
    };
    const result = getFarmerRecommendation(answers);
    // 지도에서 고른 시·군은 점수 계산에는 쓰지 않지만, 다음 단계에서 표시·활용할 수 있도록 함께 넘깁니다.
    const { gangwonRegion } = regionSelection;
    const farmLocation = gangwonRegion
      ? {
          regionId: gangwonRegion.regionId,
          regionName: gangwonRegion.regionName,
          regionGroup: answers.region,
          isHighland: regionStep.isHighland,
        }
      : null;
    navigate(ROUTES.farmerAnalyzing, { state: { cropId, answers, result, farmLocation } });
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
          <RegionSelectStep value={regionStep} onChange={setRegionStep} />
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
      case 'season': {
        if (!cropId || !isMonthTimingCrop(cropId)) return null;
        const timingHint = cropId === 'potato' ? findSeason('potato', cropSeason)?.timingHint : undefined;
        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              {SEASON_CALENDAR[cropId].map((season) => (
                <ChoiceButton
                  key={season.value}
                  label={season.label}
                  selected={cropSeason === season.value}
                  onSelect={() => setCropSeason(season.value)}
                />
              ))}
            </div>
            {timingHint && (
              <div className="flex flex-col gap-2 rounded-2xl bg-brand-ivory p-4">
                <p className="text-sm text-slate-600">
                  언제 캐고 싶으세요? <span className="text-xs text-slate-400">(선택)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {POTATO_HARVEST_OPTIONS.map((option) => (
                    <ChoiceChip
                      key={option.value}
                      label={option.label}
                      selected={harvestChoice === option.value}
                      onToggle={() => setHarvestChoice(harvestChoice === option.value ? null : option.value)}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">{timingHint}</p>
              </div>
            )}
          </div>
        );
      }
      case 'harvest': {
        if (!cropId) return null;
        let options: { value: string; label: string }[];
        if (isOrchard) options = ORCHARD_HARVEST_MONTH_OPTIONS;
        else options = CORN_HARVEST_TIMING_OPTIONS;
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
      case 'taste':
        if (!cropId || isOrchard) return null;
        return (
          <div className="flex flex-wrap gap-2">
            {TASTE_OPTIONS[cropId as keyof typeof TASTE_OPTIONS].map((option) => (
              <ChoiceChip
                key={option.value}
                label={option.label}
                selected={tastes.includes(option.value)}
                onToggle={() => setTastes((prev) => toggleMultiSelect(prev, option.value, 'any'))}
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
      default:
        return null;
    }
  };

  const meta = STEP_META[currentStepId];
  // 옥수수 수확시기는 날짜 감각용 안내를 붙입니다.
  const hint = currentStepId === 'harvest' && cropId === 'corn' ? CORN_HARVEST_HINT : meta.hint;
  const isLastStep = stepIndex === steps.length - 1;

  return (
    <Container className="font-nanum-round flex flex-col gap-6 py-8 md:py-12">
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
        {/* 지역 단계는 큰 글씨 보기 버튼과 함께 제목·안내 문구를 직접 그립니다. */}
        {currentStepId !== 'region' && (
          <div>
            <h2 className="text-lg font-bold text-slate-800">{meta.title}</h2>
            {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
          </div>
        )}

        {renderStep()}
      </section>

      <NavigationButtons
        showPrev={stepIndex > 0}
        onPrev={handlePrev}
        onNext={handleNext}
        nextDisabled={!isStepValid(currentStepId)}
        // 큰글씨 보기에서 버튼 글자가 줄바꿈될 때 화살표만 따로 떨어지지 않게 줄바꿈 없는 공백( )을 씁니다.
        nextLabel={isLastStep ? '추천 결과 보기 →' : currentStepId === 'region' ? '다음 단계로 →' : '다음 →'}
      />
    </Container>
  );
}
