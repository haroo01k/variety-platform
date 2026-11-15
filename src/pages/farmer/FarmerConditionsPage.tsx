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
  RegionAnswer,
  WinterMinAnswer,
} from '../../types/farmer';
import type { CropSeason, HazardKey } from '../../types/variety';
import {
  CLIMATE_RISK_OPTIONS,
  CORN_HARVEST_HINT,
  CORN_HARVEST_TIMING_OPTIONS,
  PLANT_MONTH_LABEL,
  SEASON_CALENDAR,
  findSeason,
  harvestMonthChoices,
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
/** 감자·배추: 재배 시기를 한 화면에서 묻습니다(작형 필수, 심는 달·수확 달은 선택). */
const MONTH_TIMING_STEPS: StepId[] = ['crop', 'region', 'climate', 'season', 'taste', 'usage', 'pest'];
/** 과수(사과·복숭아): 겨울 최저기온·줄이고 싶은 작업 포함, 유통 조건은 판로·용도에 합침 */
const ORCHARD_STEPS: StepId[] = ['crop', 'region', 'climate', 'harvest', 'winterMin', 'usage', 'pest', 'reduceWork'];

const STEP_META: Record<StepId, { title: string; hint?: string }> = {
  crop: { title: '어떤 작물을 재배하시나요?' },
  region: { title: '어느 지역에서 재배하시나요?', hint: '지역명 첫 글자를 누르거나 직접 검색해 주세요.' },
  climate: { title: '가장 걱정되는 기상위험은 무엇인가요?', hint: '여러 개 선택할 수 있어요' },
  season: { title: '언제 심고 언제 수확하시나요?', hint: '작형만 골라도 돼요. 달까지 고르면 더 정확해져요.' },
  harvest: { title: '원하는 수확 시기는 언제인가요?' },
  taste: { title: '원하는 맛·식감은 무엇인가요?', hint: '여러 개 선택할 수 있어요' },
  usage: { title: '주요 판로·유통 방식은 무엇인가요?', hint: '여러 개 선택할 수 있어요' },
  pest: { title: '특히 걱정되는 병해충이나 재배 문제가 있나요?', hint: '여러 개 선택할 수 있어요' },
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
  const [plantMonth, setPlantMonth] = useState<number | null>(null);
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
      setPlantMonth(null);
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

    // 수확 달만 고르고 심는 달을 안 골랐으면 그 작형의 가운데 심는 달로 가정합니다.
    const seasonPlantMonths = isMonthTimingCrop(cropId) ? (findSeason(cropId, cropSeason)?.plantMonths ?? []) : [];
    const assumedPlantMonth =
      harvestChoice && seasonPlantMonths.length > 0
        ? seasonPlantMonths[Math.floor((seasonPlantMonths.length - 1) / 2)]
        : null;

    const answers: FarmerAnswers = {
      cropId,
      region: region ?? 'other',
      climateRisks: (climateRisks.includes('none') ? [] : climateRisks) as HazardKey[],
      harvestTiming: cropId === 'corn' ? ((harvestChoice ?? 'any') as FieldHarvestTimingAnswer) : 'any',
      cropSeason: isMonthTimingCrop(cropId) ? cropSeason : null,
      plantMonth: isMonthTimingCrop(cropId) ? (plantMonth ?? assumedPlantMonth) : null,
      harvestTargetMonth:
        isMonthTimingCrop(cropId) && harvestChoice && harvestChoice !== 'any' ? Number(harvestChoice) : null,
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
        const calendar = findSeason(cropId, cropSeason);
        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              {SEASON_CALENDAR[cropId].map((season) => (
                <ChoiceButton
                  key={season.value}
                  label={season.label}
                  selected={cropSeason === season.value}
                  onSelect={() => {
                    // 작형이 바뀌면 심는 달·수확 달 선택도 초기화합니다.
                    if (cropSeason !== season.value) {
                      setPlantMonth(null);
                      setHarvestChoice(null);
                    }
                    setCropSeason(season.value);
                  }}
                />
              ))}
            </div>
            {calendar && cropSeason && (
              <div className="flex flex-col gap-3 rounded-2xl bg-brand-ivory p-4">
                <p className="text-xs font-semibold text-slate-500">더 정확하게 (선택)</p>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-slate-600">{PLANT_MONTH_LABEL[cropId]}</p>
                  <div className="flex flex-wrap gap-2">
                    {calendar.plantMonths.map((month) => (
                      <ChoiceChip
                        key={month}
                        label={`${month}월`}
                        selected={plantMonth === month}
                        onToggle={() => {
                          const nextMonth = plantMonth === month ? null : month;
                          setPlantMonth(nextMonth);
                          // 심는 달이 바뀌면 그보다 이른 수확 달 선택은 지웁니다.
                          if (harvestChoice && nextMonth !== null && !harvestMonthChoices(cropId, cropSeason, nextMonth).includes(Number(harvestChoice)))
                            setHarvestChoice(null);
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-slate-600">수확하고 싶은 달</p>
                  <div className="flex flex-wrap gap-2">
                    {harvestMonthChoices(cropId, cropSeason, plantMonth).map((month) => (
                      <ChoiceChip
                        key={month}
                        label={`${month}월`}
                        selected={harvestChoice === String(month)}
                        onToggle={() => setHarvestChoice(harvestChoice === String(month) ? null : String(month))}
                      />
                    ))}
                  </div>
                </div>
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
