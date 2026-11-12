import { PlaceholderImage } from './PlaceholderImage';
import { findMarketVariety } from '../../lib/varietyLookup';
import type { CropId } from '../../types/crop';

interface VarietyStampImageProps {
  cropId: CropId;
  varietyName: string;
  /** 우표 이미지를 못 찾았을 때 보여줄 이모지 */
  fallbackEmoji: string;
  /** 우표 이미지를 못 찾았을 때 placeholder 배경색(품종 캐릭터색) */
  fallbackHex?: string;
  /** 크기 클래스(예: 'h-32 w-32'). 우표는 비율을 유지한 채 이 상자 안에 맞춥니다. */
  className?: string;
  /** 의미 있는 이미지면 대체 텍스트. 없으면 장식용으로 처리합니다. */
  label?: string;
}

/**
 * 품종 "우표" 이미지(판매처 화면 marketVarieties.ts의 image). 결과 화면 곳곳에서 같은 그림을 쓰도록 모았습니다.
 * 매칭되는 우표가 없으면 기존처럼 이모지 placeholder를 보여줍니다.
 */
export function VarietyStampImage({ cropId, varietyName, fallbackEmoji, fallbackHex, className = '', label }: VarietyStampImageProps) {
  const stamp = findMarketVariety(cropId, varietyName)?.image;
  if (!stamp) {
    return <PlaceholderImage emoji={fallbackEmoji} hexColor={fallbackHex} className={`${className} text-4xl`} label={label} />;
  }
  return <img src={stamp} alt={label ?? ''} aria-hidden={label ? undefined : true} className={`${className} object-contain`} />;
}
