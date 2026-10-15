import { ChoiceChip } from '../common/ChoiceChip';
import { GangwonRegionMap } from './GangwonRegionMap';
import { REGION_OPTIONS } from '../../data/farmerOptions';
import {
  NON_GANGWON_GROUPS,
  findGangwonRegion,
  getRegionGroupCandidates,
} from '../../data/gangwonRegions';
import type { GangwonRegion, GangwonRegionId } from '../../data/gangwonRegions';
import type { RegionAnswer } from '../../types/farmer';

interface RegionMapStepProps {
  /** 지도에서 선택한 시·군 (강원도 밖을 고르면 null) */
  gangwonRegionId: GangwonRegionId | null;
  /** 기존 추천 로직에 넘길 지역 그룹(F1) */
  region: RegionAnswer | null;
  onChange: (next: { gangwonRegionId: GangwonRegionId | null; region: RegionAnswer | null }) => void;
}

const regionLabel = (value: RegionAnswer) => REGION_OPTIONS.find((option) => option.value === value)?.label ?? value;

/**
 * 농업인 F1(재배 지역) 단계.
 * 강원도 지도에서 시·군을 고르면 해당 시·군의 지역 그룹(영동·영서)으로 변환해 기존 추천 로직에 넘깁니다.
 * 고랭지 재배이거나 지역 그룹이 정해지지 않은 시·군(태백시)은 아래 칩에서 기준을 직접 고를 수 있고,
 * 강원도 밖 재배지는 기존 지역 선택지(중부·남부·그 외)를 그대로 제공합니다.
 */
export function RegionMapStep({ gangwonRegionId, region, onChange }: RegionMapStepProps) {
  const selectedRegion = findGangwonRegion(gangwonRegionId);

  const handleSelectRegion = (next: GangwonRegion) => {
    onChange({ gangwonRegionId: next.regionId, region: next.regionGroup });
  };

  return (
    <div className="flex flex-col gap-4">
      <GangwonRegionMap selectedRegionId={gangwonRegionId} onSelect={handleSelectRegion} />

      <div aria-live="polite" className="rounded-2xl bg-brand-ivory px-4 py-3 text-sm">
        {selectedRegion ? (
          <>
            <p className="font-bold text-brand-green-dark">
              선택한 지역: {selectedRegion.regionName}
              {region && <span className="font-medium text-slate-600"> · 추천 기준 {regionLabel(region)}</span>}
            </p>
            {!selectedRegion.regionGroup && !region && (
              <p className="mt-1 text-xs text-slate-500">
                {selectedRegion.regionName}은(는) 기존 추천 자료에 지역 구분이 정해져 있지 않아요. 아래에서 가장
                가까운 재배 조건을 골라주세요.
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {getRegionGroupCandidates(selectedRegion).map((group) => (
                <ChoiceChip
                  key={group}
                  label={group === 'highland' ? '고랭지에서 재배해요' : regionLabel(group)}
                  selected={region === group}
                  onToggle={() => onChange({ gangwonRegionId, region: group })}
                />
              ))}
            </div>
          </>
        ) : (
          <p className="text-slate-500">
            {region ? `강원도 밖 · 추천 기준 ${regionLabel(region)}` : '지도에서 재배하는 시·군을 눌러주세요.'}
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-slate-400">강원도 밖에서 재배하시나요?</p>
        <div className="flex flex-wrap gap-2">
          {NON_GANGWON_GROUPS.map((group) => (
            <ChoiceChip
              key={group}
              label={regionLabel(group)}
              selected={!selectedRegion && region === group}
              onToggle={() => onChange({ gangwonRegionId: null, region: group })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
