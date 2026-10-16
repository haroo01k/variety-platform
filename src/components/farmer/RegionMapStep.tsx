import { useState } from 'react';
import { ChoiceChip } from '../common/ChoiceChip';
import { GangwonRegionMap } from './GangwonRegionMap';
import { REGION_OPTIONS } from '../../data/farmerOptions';
import { HIGHLAND_AREAS, findGangwonRegion } from '../../data/gangwonRegions';
import type { GangwonRegion, GangwonRegionId } from '../../data/gangwonRegions';
import { resolveRegionAnswer } from '../../lib/farmRegion';
import type { RegionAnswer } from '../../types/farmer';

export interface RegionStepValue {
  /** 지도에서 선택한 시·군 */
  gangwonRegionId: GangwonRegionId | null;
  /** 기본 지역 그룹(영동·영서). 태백시 일반 재배지는 사용자가 고름 */
  regionGroup: RegionAnswer | null;
  /** true: 고랭지, false: 일반 재배지, null: 미확인 */
  isHighland: boolean | null;
}

interface RegionMapStepProps {
  value: RegionStepValue;
  onChange: (next: RegionStepValue) => void;
}

const regionLabel = (value: RegionAnswer) => REGION_OPTIONS.find((option) => option.value === value)?.label ?? value;

/** 태백시처럼 영동·영서가 정해지지 않은 시·군의 일반 재배지에서 고르는 기준 */
const UNDECIDED_GANGWON_GROUPS: RegionAnswer[] = ['gangwon-yeongdong', 'gangwon-yeongseo'];

/**
 * 농업인 F1(재배 지역) 단계.
 * 강원도 지도에서 시·군을 고르면 해당 시·군의 지역 그룹(영동·영서)으로 변환해 기존 추천 로직에 넘깁니다.
 * - 고랭지 재배지가 있는 시·군(highlandCheck)은 재배환경(고랭지/일반)을 먼저 확인합니다.
 * - 그 외 시·군은 고랭지 문구를 기본으로 보이지 않고, "재배환경 직접 선택"을 눌렀을 때만 고를 수 있습니다.
 * - 재배환경이 미확인(null)이면 고랭지 조건을 자동 적용하지 않습니다.
 * 지역 선택 범위는 강원특별자치도 18개 시·군으로 한정합니다.
 */
export function RegionMapStep({ value, onChange }: RegionMapStepProps) {
  const { gangwonRegionId, regionGroup, isHighland } = value;
  const selectedRegion = findGangwonRegion(gangwonRegionId);
  // 고랭지 확인 대상이 아닌 시·군에서 재배환경 선택을 펼쳤는지 여부
  const [envEditOpen, setEnvEditOpen] = useState(false);

  const handleSelectRegion = (next: GangwonRegion) => {
    // 다른 시·군을 고르면 이전 재배환경 선택은 초기화합니다.
    onChange({ gangwonRegionId: next.regionId, regionGroup: next.regionGroup, isHighland: null });
    setEnvEditOpen(false);
  };

  const setHighland = (next: boolean | null) => {
    onChange({
      gangwonRegionId,
      // 태백시처럼 기본 그룹이 없는 시·군은 일반 재배지로 바꿀 때 이전 그룹 선택을 다시 고르게 합니다.
      regionGroup: selectedRegion?.regionGroup ?? (next === false ? regionGroup : null),
      isHighland: next,
    });
  };

  const showEnvChoice = selectedRegion && (selectedRegion.highlandCheck || envEditOpen || isHighland !== null);
  const highlandExample = selectedRegion && HIGHLAND_AREAS.find((area) => area.city === selectedRegion.regionName);
  const resolved = resolveRegionAnswer({ gangwonRegion: selectedRegion, regionGroup, isHighland });

  return (
    <div className="flex flex-col gap-3">
      {/* 카드 안쪽 여백을 조금 덜 써서 지도를 최대한 크게 보여줍니다. */}
      <div className="-mx-2 sm:-mx-3">
        <GangwonRegionMap selectedRegionId={gangwonRegionId} onSelect={handleSelectRegion} />
      </div>

      {selectedRegion && (
        <div aria-live="polite" className="rounded-2xl bg-brand-ivory px-4 py-3 text-sm">
          <p className="font-bold text-brand-green-dark">
            선택한 지역: {selectedRegion.labelName}
            {resolved && <span className="font-medium text-slate-600"> · 추천 기준 {regionLabel(resolved)}</span>}
          </p>

          {showEnvChoice ? (
            <div className="mt-3">
              <p className="text-xs text-slate-600">
                {selectedRegion.highlandCheck
                  ? `${selectedRegion.regionName}에는 고랭지와 일반 재배지가 함께 있어요. 실제로 재배하시는 곳은 어떤 환경인가요?`
                  : '실제로 재배하시는 곳의 환경을 골라주세요.'}
              </p>
              {highlandExample && (
                <p className="mt-1 text-[11px] text-slate-400">
                  고랭지 예: {highlandExample.city} {highlandExample.area} 등
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <ChoiceChip
                  label="고랭지 재배지예요"
                  selected={isHighland === true}
                  onToggle={() => setHighland(isHighland === true && !selectedRegion.highlandCheck ? null : true)}
                />
                <ChoiceChip
                  label="일반 재배지예요"
                  selected={isHighland === false}
                  onToggle={() => setHighland(isHighland === false && !selectedRegion.highlandCheck ? null : false)}
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEnvEditOpen(true)}
              className="mt-2 text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-brand-green-dark"
            >
              재배환경 직접 선택하기
            </button>
          )}

          {!selectedRegion.regionGroup && isHighland === false && (
            <div className="mt-3">
              <p className="text-xs text-slate-600">
                {selectedRegion.regionName}은(는) 기존 추천 자료에 영동·영서 구분이 정해져 있지 않아요. 가까운
                기준을 골라주세요.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {UNDECIDED_GANGWON_GROUPS.map((group) => (
                  <ChoiceChip
                    key={group}
                    label={regionLabel(group)}
                    selected={regionGroup === group}
                    onToggle={() => onChange({ gangwonRegionId, regionGroup: group, isHighland })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
