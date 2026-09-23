import { VARIETIES } from '../data/varieties';
import { MARKET_VARIETIES } from '../data/marketVarieties';
import type { VarietyRecord } from '../types/variety';
import type { MarketVariety } from '../types/market';
import type { CropId } from '../types/crop';

const normalize = (name: string) => name.replace(/\s+/g, '');

/**
 * 이름 표기가 살짝 다를 수 있는 다른 데이터셋(판매처 카드 등)에서 같은 작물의
 * 원본 VarietyRecord를 찾을 때 씁니다. 공백 차이(예: "흑점 2호" ↔ "흑점2호")와
 * "옐로드림(Yellow Dream)"처럼 뒤에 영문 표기가 붙은 경우까지 매칭합니다.
 * 매칭되는 품종이 없으면 undefined를 반환하고, 호출부는 해당 정보를 조용히 생략합니다.
 */
export function findVarietyRecord(cropId: CropId, varietyName: string): VarietyRecord | undefined {
  const target = normalize(varietyName);
  return VARIETIES.find((v) => {
    if (v.cropId !== cropId) return false;
    const name = normalize(v.name);
    return name === target || name.startsWith(target) || target.startsWith(name);
  });
}

/**
 * 위 함수의 반대 방향: 추천 결과(VarietyRecord 기준 이름)로 판매처 화면(marketVarieties.ts)의
 * 같은 품종을 찾습니다. 판매처 카드에 이미 쓰고 있는 "우표" 이미지(variety.image)를
 * 다른 화면에서 그대로 재사용할 때 씁니다. 매칭 안 되면 undefined(임의 이미지 생성 없음).
 */
export function findMarketVariety(cropId: CropId, varietyName: string): MarketVariety | undefined {
  const target = normalize(varietyName);
  return MARKET_VARIETIES.find((v) => {
    if (v.crop !== cropId) return false;
    const name = normalize(v.varietyName);
    return name === target || name.startsWith(target) || target.startsWith(name);
  });
}
