import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { GANGWON_GEO, GANGWON_VIEWBOX } from '../../data/gangwonGeo';
import { GANGWON_REGIONS } from '../../data/gangwonRegions';
import type { GangwonRegion, GangwonRegionId } from '../../data/gangwonRegions';
import { darkenHex } from '../../lib/colorUtils';

interface GangwonRegionMapProps {
  selectedRegionId: GangwonRegionId | null;
  onSelect: (region: GangwonRegion) => void;
}

/**
 * 이름표 위치 보정(viewBox 좌표 기준 이동량). 좁은 화면에서 이웃 이름표와 겹치거나
 * 면적이 작은 시·군 경계를 벗어나는 경우만 조정합니다.
 */
const LABEL_OFFSETS: Partial<Record<GangwonRegionId, [number, number]>> = {
  cheorwon: [-8, 0],
  hwacheon: [2, 8],
  chuncheon: [5, 5],
  wonju: [8, 0],
  hongcheon: [0, 8],
  gangneung: [0, -8],
  yangyang: [0, -8],
  samcheok: [0, -8],
  donghae: [-8, 0],
  taebaek: [0, -8],
};

const MAP_REGIONS = GANGWON_REGIONS.map((region) => {
  const geo = GANGWON_GEO.find((feature) => feature.code === region.code);
  if (!geo) throw new Error(`지도 경계 데이터가 없습니다: ${region.regionName}`);
  const [dx, dy] = LABEL_OFFSETS[region.regionId] ?? [0, 0];
  return {
    ...region,
    d: geo.d,
    label: [geo.label[0] + dx, geo.label[1] + dy] as const,
    hoverColor: darkenHex(region.color, 0.1),
    selectedColor: darkenHex(region.color, 0.22),
    outlineColor: darkenHex(region.color, 0.4),
  };
});

const { width: VIEW_W, height: VIEW_H } = GANGWON_VIEWBOX;

/**
 * 강원특별자치도 18개 시·군 인터랙티브 지도(농업인 재배지역 선택용).
 * 실제 행정구역 경계(통계청 2013, gangwonGeo.ts)를 SVG path로 그리고,
 * 모든 시·군 이름표(철원권·강릉권 등, 같은 흰색 둥근 디자인)는 글자 크기가 화면 폭에 따라 너무 작아지지 않도록
 * SVG 위에 HTML로 겹쳐 배치합니다. 선택 상태는 부모가 관리합니다.
 */
export function GangwonRegionMap({ selectedRegionId, onSelect }: GangwonRegionMapProps) {
  const [hoveredId, setHoveredId] = useState<GangwonRegionId | null>(null);

  const handleKeyDown = (event: KeyboardEvent, region: GangwonRegion) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(region);
    }
  };

  const hovered = MAP_REGIONS.find((r) => r.regionId === hoveredId && r.regionId !== selectedRegionId);
  const selected = MAP_REGIONS.find((r) => r.regionId === selectedRegionId);

  return (
    // 너비는 부모에 맞추되, 지도 높이가 화면 높이의 75%를 넘지 않도록 최대 너비를 제한합니다(비율 유지).
    <div
      className="relative mx-auto w-full"
      style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}`, maxWidth: `calc(75vh * ${VIEW_W} / ${VIEW_H})` }}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="absolute inset-0 h-full w-full drop-shadow-[0_6px_12px_rgba(31,92,51,0.12)]"
        role="group"
        aria-label="강원특별자치도 시·군 지도"
      >
        {/* 도 전체 외곽선: 같은 path를 굵은 선으로 먼저 깔아 두면 내부 경계는 위 레이어에 가려지고 바깥 윤곽만 남습니다. */}
        <g aria-hidden="true" fill="#cfe0c2" stroke="#cfe0c2" strokeWidth={4} strokeLinejoin="round">
          {MAP_REGIONS.map((region) => (
            <path key={region.regionId} d={region.d} vectorEffect="non-scaling-stroke" />
          ))}
        </g>

        <g stroke="#ffffff" strokeWidth={1.6} strokeLinejoin="round">
          {MAP_REGIONS.map((region) => {
            const isSelected = region.regionId === selectedRegionId;
            const isHovered = region.regionId === hoveredId;
            const fill = isSelected ? region.selectedColor : isHovered ? region.hoverColor : region.color;
            return (
              <path
                key={region.regionId}
                d={region.d}
                vectorEffect="non-scaling-stroke"
                role="button"
                tabIndex={0}
                aria-label={region.regionName}
                aria-pressed={isSelected}
                style={{ fill }}
                className="cursor-pointer transition-colors duration-200 outline-none"
                onClick={() => onSelect(region)}
                onKeyDown={(event) => handleKeyDown(event, region)}
                onMouseEnter={() => setHoveredId(region.regionId)}
                onMouseLeave={() => setHoveredId((prev) => (prev === region.regionId ? null : prev))}
                onFocus={() => setHoveredId(region.regionId)}
                onBlur={() => setHoveredId((prev) => (prev === region.regionId ? null : prev))}
              />
            );
          })}
        </g>

        {/* 강조 외곽선(hover·선택)은 이웃 경계에 가려지지 않도록 맨 위에 다시 그립니다. */}
        <g aria-hidden="true" fill="none" strokeLinejoin="round" pointerEvents="none">
          {hovered && (
            <path d={hovered.d} stroke={hovered.outlineColor} strokeWidth={2} vectorEffect="non-scaling-stroke" />
          )}
          {selected && <path d={selected.d} stroke="#1f5c33" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />}
        </g>
      </svg>

      {/* 이름표: 클릭하면 해당 시·군이 선택됩니다(스크린리더는 위 path 버튼을 사용하므로 숨김). */}
      {MAP_REGIONS.map((region) => {
        const isSelected = region.regionId === selectedRegionId;
        const isActive = isSelected || region.regionId === hoveredId;
        const position = {
          left: `${(region.label[0] / VIEW_W) * 100}%`,
          top: `${(region.label[1] / VIEW_H) * 100}%`,
        };
        const sharedProps = {
          'aria-hidden': true,
          style: position,
          onClick: () => onSelect(region),
          onMouseEnter: () => setHoveredId(region.regionId),
          onMouseLeave: () => setHoveredId((prev: GangwonRegionId | null) => (prev === region.regionId ? null : prev)),
        };

        return (
          <span
            key={region.regionId}
            {...sharedProps}
            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer whitespace-nowrap rounded-md border bg-[#fffdf6] px-1 py-0.5 text-[9px] leading-tight font-bold text-brand-green-dark transition-[box-shadow,border-color] duration-200 select-none sm:rounded-lg sm:px-2 sm:text-xs ${
              isSelected
                ? 'border-brand-green-dark shadow-md'
                : isActive
                  ? 'border-white shadow-[0_2px_6px_rgba(31,92,51,0.22)]'
                  : 'border-white/80 shadow-[0_1px_2px_rgba(31,92,51,0.08)]'
            }`}
          >
            {region.labelName}
          </span>
        );
      })}
    </div>
  );
}
