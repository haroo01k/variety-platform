import { useMemo, useState } from 'react';
import { ChoiceChip } from '../common/ChoiceChip';
import { CheckIcon, SearchIcon } from '../common/icons';
import { REGION_OPTIONS } from '../../data/farmerOptions';
import { GANGWON_REGIONS, HIGHLAND_AREAS, findGangwonRegion } from '../../data/gangwonRegions';
import type { GangwonRegion, GangwonRegionId } from '../../data/gangwonRegions';
import { resolveRegionAnswer } from '../../lib/farmRegion';
import { HANGUL_INITIALS, getInitial, isInitialsOnly, toInitials } from '../../lib/hangul';
import type { RegionAnswer } from '../../types/farmer';

export interface RegionStepValue {
  /** 선택한 시·군 */
  gangwonRegionId: GangwonRegionId | null;
  /** 기본 지역 그룹(영동·영서). 태백시 일반 재배지는 사용자가 고름 */
  regionGroup: RegionAnswer | null;
  /** true: 고랭지, false: 일반 재배지, null: 미확인 */
  isHighland: boolean | null;
}

interface RegionSelectStepProps {
  value: RegionStepValue;
  onChange: (next: RegionStepValue) => void;
}

const regionLabel = (value: RegionAnswer) => REGION_OPTIONS.find((option) => option.value === value)?.label ?? value;

/** 태백시처럼 영동·영서가 정해지지 않은 시·군의 일반 재배지에서 고르는 기준 */
const UNDECIDED_GANGWON_GROUPS: RegionAnswer[] = ['gangwon-yeongdong', 'gangwon-yeongseo'];

/** 가나다순으로 정렬한 강원도 18개 시·군 */
const SORTED_REGIONS = [...GANGWON_REGIONS].sort((a, b) => (a.regionName < b.regionName ? -1 : 1));

const initialOf = (region: GangwonRegion) => getInitial(region.regionName);

/** 실제 시·군 이름에 있는 초성만, 자음 순서대로 */
const AVAILABLE_INITIALS = HANGUL_INITIALS.filter((initial) => SORTED_REGIONS.some((region) => initialOf(region) === initial));

/** 지역명 일부('춘천', '릉') 또는 초성('ㅊㅊ')으로 시·군을 찾습니다. */
function searchRegions(query: string): GangwonRegion[] {
  const keyword = query.replace(/\s/g, '');
  if (!keyword) return [];
  if (isInitialsOnly(keyword)) {
    return SORTED_REGIONS.filter((region) => toInitials(region.regionName).startsWith(keyword));
  }
  return SORTED_REGIONS.filter((region) => region.regionName.includes(keyword));
}

const LARGE_TEXT_STORAGE_KEY = 'farmer-large-text';

function readLargeTextPreference(): boolean {
  try {
    return window.localStorage.getItem(LARGE_TEXT_STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
}

function saveLargeTextPreference(on: boolean) {
  try {
    window.localStorage.setItem(LARGE_TEXT_STORAGE_KEY, on ? 'on' : 'off');
  } catch {
    // 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 이번 화면에서만 적용합니다.
  }
}

/**
 * 농업인 F1(재배 지역) 단계.
 * 고령 농업인이 작은 지도 대신 "지역명 검색" 또는 "첫 글자(초성) 버튼 → 큰 지역명 버튼"으로
 * 강원특별자치도 18개 시·군을 고르게 합니다. 고른 시·군은 지역 그룹(영동·영서)으로 변환해 기존 추천 로직에 넘깁니다.
 * - 검색어를 입력하면 초성 선택을 해제하고 검색 결과를, 초성을 누르면 검색어를 지우고 초성별 목록을 보여줍니다.
 * - 고랭지 재배지가 있는 시·군(highlandCheck)은 재배환경(고랭지/일반)을 먼저 확인합니다.
 * - 그 외 시·군은 "재배환경 직접 선택"을 눌렀을 때만 고를 수 있고, 미확인(null)이면 고랭지 조건을 자동 적용하지 않습니다.
 * - "가+ 큰 글씨"를 켜면 제목·안내·버튼·선택 확인 문구가 함께 커지고, 설정은 이 기기에 기억합니다.
 */
export function RegionSelectStep({ value, onChange }: RegionSelectStepProps) {
  const { gangwonRegionId, regionGroup, isHighland } = value;
  const selectedRegion = findGangwonRegion(gangwonRegionId);

  const [query, setQuery] = useState('');
  // 이전 단계에서 돌아왔을 때는 이미 고른 시·군의 초성 목록을 펼쳐 둡니다.
  const [activeInitial, setActiveInitial] = useState<string | null>(selectedRegion ? initialOf(selectedRegion) : null);
  const [largeText, setLargeText] = useState(readLargeTextPreference);
  // 고랭지 확인 대상이 아닌 시·군에서 재배환경 선택을 펼쳤는지 여부
  const [envEditOpen, setEnvEditOpen] = useState(false);

  const isSearching = query.trim().length > 0;
  const searchResults = useMemo(() => searchRegions(query), [query]);
  const visibleRegions = isSearching
    ? searchResults
    : activeInitial
      ? SORTED_REGIONS.filter((region) => initialOf(region) === activeInitial)
      : [];

  const toggleLargeText = () => {
    setLargeText((prev) => {
      saveLargeTextPreference(!prev);
      return !prev;
    });
  };

  const clearRegion = () => {
    onChange({ gangwonRegionId: null, regionGroup: null, isHighland: null });
    setEnvEditOpen(false);
  };

  const handleSearchChange = (next: string) => {
    setQuery(next);
    // 검색 중에는 초성 목록 대신 검색 결과만 보여줍니다(이미 고른 지역은 유지).
    if (next.trim()) setActiveInitial(null);
  };

  const handleSelectInitial = (initial: string) => {
    setQuery('');
    if (initial === activeInitial) return;
    setActiveInitial(initial);
    // 초성을 바꾸면 새 목록에 보이지 않는 이전 선택은 초기화합니다.
    if (selectedRegion && initialOf(selectedRegion) !== initial) clearRegion();
  };

  const handleSelectRegion = (next: GangwonRegion) => {
    // 이미 고른 지역을 다시 누르면 선택을 해제합니다.
    if (next.regionId === gangwonRegionId) {
      clearRegion();
      return;
    }
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

  const sizes = largeText
    ? {
        title: 'text-2xl sm:text-3xl',
        hint: 'text-lg sm:text-xl',
        label: 'text-lg sm:text-xl',
        input: 'h-[72px] text-xl',
        initial: 'text-3xl sm:text-4xl',
        region: 'min-h-[76px] text-2xl',
        summary: 'text-xl sm:text-2xl',
        detail: 'text-base sm:text-lg',
      }
    : {
        title: 'text-xl sm:text-2xl',
        hint: 'text-base',
        label: 'text-base',
        input: 'h-16 text-lg',
        initial: 'text-2xl sm:text-3xl',
        region: 'min-h-[64px] text-xl',
        summary: 'text-lg',
        detail: 'text-sm sm:text-base',
      };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1">
          <h2 className={`font-bold break-keep text-slate-800 ${sizes.title}`}>어느 지역에서 재배하시나요?</h2>
          <p className={`mt-1 break-keep text-slate-600 ${sizes.hint}`}>지역명 첫 글자를 누르거나 직접 검색해 주세요.</p>
        </div>
        <button
          type="button"
          onClick={toggleLargeText}
          aria-pressed={largeText}
          className={`inline-flex min-h-[48px] shrink-0 items-center gap-1 rounded-full border-2 px-4 text-base font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green ${
            largeText
              ? 'border-brand-green bg-brand-green text-white'
              : 'border-brand-green bg-white text-brand-green-dark hover:bg-brand-green-light'
          }`}
        >
          <span aria-hidden="true" className="text-lg leading-none">
            가+
          </span>
          큰 글씨
        </button>
      </div>

      <div className="relative">
        <label htmlFor="region-search" className="sr-only">
          지역명 검색
        </label>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-6 w-6 -translate-y-1/2 text-slate-500" />
        <input
          id="region-search"
          type="search"
          value={query}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="지역명 검색 (예: 춘천)"
          autoComplete="off"
          enterKeyHint="search"
          className={`w-full rounded-2xl border-2 border-slate-300 bg-white pr-4 pl-12 font-medium text-slate-800 placeholder:text-slate-500 focus:border-brand-green focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-green/20 ${sizes.input}`}
        />
      </div>

      <div>
        <p id="region-initial-label" className={`mb-2 font-bold text-slate-700 ${sizes.label}`}>
          지역명 첫 글자 선택
        </p>
        {/* 9개 초성을 5열로 두어 모바일·PC 모두 2줄 안에 정사각형 버튼으로 보여줍니다. */}
        <div role="group" aria-labelledby="region-initial-label" className="grid grid-cols-5 gap-1.5 sm:max-w-[26rem] sm:gap-2.5">
          {AVAILABLE_INITIALS.map((initial) => {
            const active = !isSearching && activeInitial === initial;
            return (
              <button
                key={initial}
                type="button"
                onClick={() => handleSelectInitial(initial)}
                aria-pressed={active}
                aria-label={`${initial}으로 시작하는 지역 보기`}
                className={`flex aspect-square items-center justify-center rounded-2xl border-2 font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green ${sizes.initial} ${
                  active
                    ? 'border-brand-green bg-brand-green text-white shadow-sm'
                    : 'border-slate-300 bg-white text-slate-800 hover:border-brand-green hover:bg-brand-green-light'
                }`}
              >
                {initial}
              </button>
            );
          })}
        </div>
      </div>

      {(isSearching || activeInitial) && (
        <div>
          <p className={`mb-2 font-bold text-slate-700 ${sizes.label}`} aria-live="polite">
            {isSearching ? `‘${query.trim()}’ 검색 결과 ${searchResults.length}곳` : `‘${activeInitial}’으로 시작하는 지역`}
          </p>
          {visibleRegions.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {visibleRegions.map((region) => {
                const selected = region.regionId === gangwonRegionId;
                return (
                  <button
                    key={region.regionId}
                    type="button"
                    onClick={() => handleSelectRegion(region)}
                    aria-pressed={selected}
                    className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-3 py-2 font-bold break-keep transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green ${sizes.region} ${
                      selected
                        ? 'border-brand-green bg-brand-green-light text-brand-green-dark shadow-sm'
                        : 'border-slate-300 bg-white text-slate-800 hover:border-brand-green/60'
                    }`}
                  >
                    {selected && <CheckIcon className="h-6 w-6 shrink-0 text-brand-green" />}
                    {region.regionName}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className={`rounded-2xl bg-slate-50 px-4 py-4 text-slate-600 ${sizes.detail}`}>
              찾는 지역이 없어요. 강원도 시·군 이름을 확인하시거나 위의 첫 글자 버튼을 눌러 주세요.
            </p>
          )}
        </div>
      )}

      <div aria-live="polite" className="rounded-2xl bg-brand-ivory px-4 py-4">
        {selectedRegion ? (
          <>
            <p className={`font-bold break-keep text-brand-green-dark ${sizes.summary}`}>
              선택한 재배지역: {selectedRegion.regionName}
            </p>
            {resolved && <p className={`mt-1 text-slate-600 ${sizes.detail}`}>추천 기준: {regionLabel(resolved)}</p>}
          </>
        ) : (
          <p className={`font-bold text-slate-600 ${sizes.summary}`}>아직 선택한 지역이 없습니다.</p>
        )}

        {selectedRegion &&
          (showEnvChoice ? (
            <div className="mt-3">
              <p className={`break-keep text-slate-700 ${sizes.detail}`}>
                {selectedRegion.highlandCheck
                  ? `${selectedRegion.regionName}에는 고랭지와 일반 재배지가 함께 있어요. 실제로 재배하시는 곳은 어떤 환경인가요?`
                  : '실제로 재배하시는 곳의 환경을 골라주세요.'}
              </p>
              {highlandExample && (
                <p className={`mt-1 text-slate-500 ${sizes.detail}`}>
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
              className={`mt-2 min-h-[44px] font-medium text-slate-600 underline underline-offset-2 hover:text-brand-green-dark ${sizes.detail}`}
            >
              재배환경 직접 선택하기
            </button>
          ))}

        {selectedRegion && !selectedRegion.regionGroup && isHighland === false && (
          <div className="mt-3">
            <p className={`break-keep text-slate-700 ${sizes.detail}`}>
              {selectedRegion.regionName}은(는) 기존 추천 자료에 영동·영서 구분이 정해져 있지 않아요. 가까운 기준을
              골라주세요.
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
    </div>
  );
}
